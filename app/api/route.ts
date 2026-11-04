'use server'
import { cookies } from "next/headers";
import { Language, Level, Prompt } from '../types';
import { promptSchema, readingSchema, reviewGeneration, checkRateLimit } from '@/lib';
import logger from '@/lib/logger';
import { getPromptById } from '@/lib/db';
import { getUserIdFromAccessToken } from '@/lib/supabase/server';
import { useAuth } from "../context/AuthContext";

export async function GET() {
    return new Response('API is running');
}

// export async function POST(request: Request) {
//     const { success } = await checkRateLimit();
//     if (!success) {
//         return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
//             status: 429,
//             headers: { 'Content-Type': 'application/json' }
//         });
//     }

//     const { language, level, prompt, input } = await request.json();
//     logger.debug('Received POST request with:', { language, level });

//     const response = await reviewGeneration(userId || "anonymous", prompt, input);
//     return new Response(JSON.stringify(response), {
//         headers: { 'Content-Type': 'application/json' }
//     });
// }

/**
 * Updates the language preference in cookies.
 * @param language - Language code to set in cookies
 */
export async function languageChange( language: Language ) {
    logger.debug('Setting language to:', language);
    const store = await cookies();
    store.set('locale', language, { path: '/' });
}

/**
 * Review the user's answer to a stored writing prompt.
 * The user and the prompt are resolved on the server, so a client cannot
 * submit on behalf of another user or supply its own prompt text.
 * @param accessToken - Supabase access token of the signed-in user, or null for anonymous users
 * @param promptId - ID of the prompt returned by getWritingPrompt
 * @param input - The user's written answer
 * @returns A string that combines the Mistral API response, or an error message.
 */
export async function reviewAnswer(accessToken: string | null, promptId: string, input: string) {
    const { success } = await checkRateLimit();
    if (!success) {
        return 'Rate limit exceeded. Please wait a moment before trying again.';
    }

    if (
        (accessToken !== null && typeof accessToken !== 'string') ||
        typeof promptId !== 'string' || promptId.length === 0 ||
        typeof input !== 'string'
    ) {
        return 'Invalid request.';
    }

    let prompt: Prompt | null;
    try {
        prompt = await getPromptById(promptId);
    } catch (error) {
        logger.warn('Failed to load prompt:', error);
        prompt = null;
    }
    if (!prompt) {
        return 'Prompt not found.';
    }

    const userId = await getUserIdFromAccessToken(accessToken);
    const response = await reviewGeneration(userId, prompt, input);
    const reply = stringifyReview(response) || 'No response.'
    return reply;
}

/**
 * Turn the response JSON into a string to be passed to the client.
 * @param review - The review object, which includes a pre-computed totalScore from reviewGeneration.
 */
export async function stringifyReview (review: JSON) {
    let result = '';
    let achieved = 0;
    let outOf = 0;

    // First pass: get outOf value
    for (const [key, value] of Object.entries(review)) {
        if (key === 'outOf') {
            outOf = value as number;
            break;
        }
    }

    // Second pass: build result string and sum scores
    // Exclude non-scoring fields from the sum (feedback text and metadata)
    const excludeFromSum = ['outOf', 'language', 'level', 'name'];

    for (const [key, value] of Object.entries(review)) {
        if (key === 'outOf') {
            continue;
        }
        result += `${key}:${value}\n`;
        // Only sum numeric values that are scoring criteria (not feedback text)
        if (typeof value === 'number' && !excludeFromSum.includes(key)) {
            achieved += value;
        }
    }

    result += `totalScore: ${achieved}/${outOf}${outOf === 100 ? "" : ` (${(achieved / outOf * 100).toFixed(0)}%)`}\n`;
    return result;
}

/**
 * Get a writing prompt for the given language and CEFR level.
 * @param language
 * @param level
 * @returns An object containing the prompt, language, and level, or null if rate limited.
 */
export async function getWritingPrompt(language: Language, level: Level) {
    const { success } = await checkRateLimit();
    if (!success) {
        logger.warn('Rate limit exceeded for getPrompt');
        return { error: 'Rate limit exceeded. Please wait a moment before trying again.' };
    }

    return promptSchema(language, level);
}

/**
 * Get a reading comprehension text with questions for the given language and CEFR level.
 * @param language
 * @param level
 * @returns An object containing the reading text, questions, language, and level, or null if rate limited.
 */
export async function getReadingPrompt(language: Language, level: Level) {
    const { success } = await checkRateLimit();
    if (!success) {
        logger.warn('Rate limit exceeded for getReading');
        return { error: 'Rate limit exceeded. Please wait a moment before trying again.' };
    }

    return readingSchema(language, level);
}