'use server'
import { cookies } from "next/headers";
import { Language, Level } from '../types';
import { promptSchema, reviewGeneration } from '@/lib';
import logger from '@/lib/logger';

export async function GET() {
    return new Response('API is running');
}

export async function POST(request: Request) {
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
 * @returns A string that combines the Mistral API response. 
 */
export async function reviewAnswer(language: Language, level: Level, prompt: string, input: string) {
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
    let oufOf = 0;
    for (const [key, value] of Object.entries(review)) {
        if (key === 'outOf') {
            oufOf = value as number;
            continue;
        }
        result += `${key}:${value}\n`;
        if (typeof value === 'number') {
            achieved += value;
        }
    }
    result += `totalScore: ${achieved}/${oufOf}${oufOf === 100 ? "" : ` (${(achieved / oufOf * 100).toFixed(0)}%)`}\n`;
    return result;
}

/**
 * Get a writing prompt for the given language and CEFR level.
 * @param language 
 * @param level 
 * @returns An object containing the prompt, language, and level.
 */
export async function getPrompt(language: Language, level: Level) {
    return promptSchema(language, level);
}