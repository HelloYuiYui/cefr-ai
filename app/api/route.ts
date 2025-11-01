'use server'
import { cookies } from "next/headers";
import mistral from '../../lib/mistral';
import { Language, LanguageNames, Level, MODEL } from '../types';
import { promptSchema, reviewGeneration } from '@/lib';

export async function languageChange( language: Language ) {
    console.log('Setting language to:', language);
    const store = await cookies();
    store.set('locale', language, { path: '/' });
}

export async function reviewAnswer(language: Language, level: Level, prompt: string, input: string) {
    const response = await reviewGeneration(language, level, prompt, input);
    const reply = stringifyReview(response) || 'No response.'
    return reply;
}

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

export async function getStarterMessage() {
    const response = await mistral.chat.complete({
        model: MODEL,
        messages: [
            {
                role: 'user',
                content: 'Create a welcome message to a web page that is intended to be used as a practice tool for language learners. It presents writing prompts to users in selected CEFR levels in A1, A2, B1, B2, in French and German.'
            }
        ],
        responseFormat: { 
            type: 'json_schema', 
            jsonSchema: {
                name: 'StarterMessage',
                description: 'A welcome message for the CEFR Text Analyzer web page.',
                schemaDefinition: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        message: { type: 'string' }
                    },
                    required: ['message'],
                    additionalProperties: false
                }
            }
        },
    })
    let reply
    try {
        const content = response.choices?.[0]?.message?.content
        
        if (typeof content === 'string') {
            // content is already a string, safe to parse
            reply = JSON.parse(content) // eslint-disable-line no-undef 
            console.log('Parsed reply:', reply.message)
        } else if (Array.isArray(content)) {
            // If the model returned chunks, join them into a string and try to parse
            const joined = content.map(chunk => (typeof chunk === 'string' ? chunk : JSON.stringify(chunk))).join('')
            try {
                reply = JSON.parse(joined)
                console.log('Parsed reply:', reply.message)
            } catch (err) {
                console.error('Error parsing joined content:', err)
            }
        } 
    } catch (error) {
        console.error('Error parsing reply:', error)
    }
    return reply;
}

export async function getPrompt(language: Language, level: Level) {
    return promptSchema(language, level);
}