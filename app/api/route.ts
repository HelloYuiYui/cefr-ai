'use server'
import { cookies } from "next/headers";
import { Language, Level } from '../types';
import { promptSchema, readingSchema, reviewGeneration, checkRateLimit } from '@/lib';
import logger from '@/lib/logger';

export async function GET() {
    return new Response('API is running');
}

export async function POST(request: Request) {
    const { success } = await checkRateLimit();
    if (!success) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { language, level, prompt, input } = await request.json();
    logger.debug('Received POST request with:', { language, level, prompt, input });

    const response = await reviewGeneration(language, level, prompt, input);
    return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' }
    });
}

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
 * Review the given answer according to the given prompt, language, and CEFR level.
 * @param language
 * @param level
 * @param prompt
 * @param input
 * @returns A string that combines the Mistral API response, or error message if rate limited.
 */
export async function reviewAnswer(language: Language, level: Level, prompt: string, input: string) {
    const { success } = await checkRateLimit();
    if (!success) {
        return 'Rate limit exceeded. Please wait a moment before trying again.';
    }

    const response = await reviewGeneration(language, level, prompt, input);
    const reply = stringifyReview(response) || 'No response.'
    return reply;
}

/**
 * Turn the response JSON into a string to be passed to the client.
 * @param review 
 * @returns 
 */
function stringifyReview (review: JSON) {
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
export async function getPrompt(language: Language, level: Level) {
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
export async function getReading(language: Language, level: Level) {
    const { success } = await checkRateLimit();
    if (!success) {
        logger.warn('Rate limit exceeded for getReading');
        return { error: 'Rate limit exceeded. Please wait a moment before trying again.' };
    }

    return readingSchema(language, level);
}