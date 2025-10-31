'use server'
import { NextResponse } from 'next/server'
import { cookies } from "next/headers";
import { Mistral } from "@mistralai/mistralai";
import { Language, LanguageNames, Level, MODEL } from '../types';

const mistral = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY
});

export async function POST(req: Request) {
    const { message } = await req.json()

    const response = await mistral.chat.complete({
        model: MODEL,
        messages: [{ role: 'user', content: message }],
    })

    const data = await response
    const reply = data.choices?.[0]?.message?.content || 'No response.'
    return NextResponse.json({ reply })
}

export async function languageChange( language: Language ) {
    console.log('Setting language to:', language);
    const store = await cookies();
    store.set('locale', language, { path: '/' });
}

export async function submitHandle(input: string) {
    console.log('Received input:', input);
    const response = await mistral.chat.complete({
        model: MODEL,
        messages: [
            {
                role: 'user',
                content: `Please review the following text and provide feedback: ${input}`
            }
        ],
    })
    const reply = response.choices?.[0]?.message?.content || 'No response.'
    console.log('Model reply:', reply);
    return reply;
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
    const languageName = LanguageNames[language];
    console.log(`Generating prompt for language: ${languageName}, level: ${level}`);
    const prompt = `Provide a writing prompt in ${languageName} for CEFR level ${level}. The prompt should be engaging and suitable for learners at this proficiency level.`
    const response = await mistral.chat.complete({
        model: MODEL,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
    })
    return response.choices?.[0]?.message?.content || 'No response.';
}