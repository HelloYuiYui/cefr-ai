import { Language, Level, Levels, MODEL } from "@/app/types";
import mistral from "../mistral";
import { baseline, frenchA1, germanB1 } from "./prompts";
import { frenchA1Schema, frenchA1SchemaJson, germanB1Schema, germanB1SchemaJson } from './reviews';
import logger from '@/lib/logger';
import z from 'zod';

/**
 * Generate a review for the user's writing based on the given prompt and user input.
 * @param language - The language of the writing (e.g., French, German).
 * @param level - The CEFR level of the writing (e.g., A1, A2, B1, B2).
 * @param prompt - The writing prompt provided to the user.
 * @param userInput - The user's written response to the prompt.
 * @returns A structured review of the user's writing, including feedback on various aspects.
 */
export type FrenchA1 = z.infer<typeof frenchA1Schema>;
export type GermanB1 = z.infer<typeof germanB1Schema>;

const defaultSchema = z.object({
    grammarFeedback: z.string(),
    vocabularyFeedback: z.string(),
    textFluencyFeedback: z.string(),
    totalScore: z.number().optional(),
    outOf: z.number().optional(),
    language: z.string(),
    level: z.string()
});

const defaultSchemaJson = {
    type: 'object',
    properties: {
        grammarFeedback: { type: 'string', description: 'Feedback on grammatical accuracy and range.' },
        vocabularyFeedback: { type: 'string', description: 'Feedback on vocabulary use and appropriateness.' },
        textFluencyFeedback: { type: 'string', description: 'Feedback on the fluency and coherence of the text.' },
        totalScore: { type: 'number', minSize: 0, maxSize: 100, step: 1 },
        outOf: { type: 'number', default: 100 },
        language: { type: 'string' },
        level: { type: 'string', description: 'Estimated CEFR level of the user based on their written production. Only use [A1, A2, B1, B2, C1, C2]' }
    },
    required: ['grammarFeedback', 'vocabularyFeedback', 'textFluencyFeedback', 'language', 'level'],
    additionalProperties: false
};

export type DefaultReview = z.infer<typeof defaultSchema>;

export type ReviewResult = FrenchA1 | GermanB1 | DefaultReview;

export const reviewGeneration = async (language: Language, level: Level, prompt: string, userInput: string): Promise<JSON> => {
    logger.debug('Generating review for', language, level);
    let response;
    switch (language) {
        case (Language.FRENCH):
            switch (level) {
                case Levels.A1:
                    response = await mistral.chat.complete({
                        model: MODEL,
                        messages: [
                            {
                                role: 'system',
                                content: frenchA1(prompt, userInput)
                            }
                        ],
                        responseFormat: {
                            type: 'json_schema',
                            jsonSchema: {
                                name: 'frenchA1',
                                description: 'Feedback for A1 level French learner.',
                                schemaDefinition: frenchA1SchemaJson
                            }
                        }
                    });
                    logger.debug('Generated review for French A1 level:', response.choices[0].message);
                    break;
            }
            if (level === Levels.A1) break;
        case (Language.GERMAN):
            switch (level) {
                case Levels.B1:
                    response = await mistral.chat.complete({
                        model: MODEL,
                        messages: [
                            {
                                role: 'system',
                                content: germanB1(prompt, userInput)
                            }
                        ],
                        responseFormat: {
                            type: 'json_schema',
                            jsonSchema: {
                                name: 'germanB1',
                                description: 'Feedback for a B1 level German learner.',
                                schemaDefinition: germanB1SchemaJson
                            }
                        }
                    });
                    logger.debug('Generated review for German B1 level:', response.choices[0].message);
                    break;
            }
            if (level === Levels.B1) break;
        default:
            response = await mistral.chat.complete({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: baseline(prompt, userInput, language, level)
                    }
                ],
                responseFormat: {
                    type: 'json_schema',
                    jsonSchema: {
                        name: 'default',
                        description: 'Feedback for an unschematised language or level learner.',
                        schemaDefinition: {
                            type: 'object',
                            properties: {
                                grammarFeedback: { type: 'string', description: 'Feedback on grammatical accuracy and range.' },
                                vocabularyFeedback: { type: 'string', description: 'Feedback on vocabulary use and appropriateness.' },
                                textFluencyFeedback: { type: 'string', description: 'Feedback on the fluency and coherence of the text.' },
                                totalScore: { type: 'number', minSize: 0, maxSize: 100, step: 1 },
                                outOf: { type: 'number', default: 100 },
                                language: { type: 'string' },
                                level: { type: 'string', description: 'Estimated CEFR level of the user based on their written production. Only use [A1, A2, B1, B2, C1, C2]' }
                            },
                            required: ['grammarFeedback', 'vocabularyFeedback', 'textFluencyFeedback', 'totalScore', 'language', 'level'],
                            additionalProperties: false
                        }
                    }
                }
            });
            break;
    }
    const content = response!.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
        throw new Error(`Unexpected model response format: ${JSON.stringify(content)}`);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(content);
    } catch (err) {
        throw new Error(`Failed to parse model JSON response: ${String(err)}`);
    }

    // Choose schema based on language/level
    // const isFrenchA1 = language === Language.FRENCH && level === Levels.A1;

    // if (isFrenchA1) {
    //     const result = frenchA1Schema.safeParse(parsed);
    //     if (!result.success) {
    //         logger.error('French A1 schema validation failed', result.error.format());
    //         throw new Error(`Model returned invalid French A1 schema: ${JSON.stringify(result.error.errors)}`);
    //     }
    //     return result.toJSON();
    // }

    // const defaultParse = defaultSchema.safeParse(parsed);
    // if (!defaultParse.success) {
    //     logger.error('Default schema validation failed', defaultParse.error.format());
    //     throw new Error(`Model returned invalid default review schema: ${JSON.stringify(defaultParse.error.errors)}`);
    // }

    // return defaultParse.data as DefaultReview;
    return parsed as JSON;
}

export default reviewGeneration;