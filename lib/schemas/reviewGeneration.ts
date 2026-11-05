import { Language, Level, Levels, MODEL, Prompt } from "@/app/types";
import mistral from "../mistral";
import { baseline, frenchA1, frenchA2, frenchB1, frenchB2, germanB1, reviewSubmission } from "./prompts";
import {
    frenchA1Schema, frenchA1SchemaJson,
    frenchA2Schema, frenchA2SchemaJson,
    frenchB1Schema, frenchB1SchemaJson,
    frenchB2Schema, frenchB2SchemaJson,
    germanB1Schema, germanB1SchemaJson
} from './reviews';
import logger from '@/lib/logger';
import z from 'zod';
import { responseToDatabase } from "../db";

/**
 * Generate a review for the user's writing based on the given prompt and user input.
 * @param language - The language of the writing (e.g., French, German).
 * @param level - The CEFR level of the writing (e.g., A1, A2, B1, B2).
 * @param prompt - The writing prompt provided to the user.
 * @param userInput - The user's written response to the prompt.
 * @returns A structured review of the user's writing, including feedback on various aspects.
 */
export type FrenchA1 = z.infer<typeof frenchA1Schema>;
export type FrenchA2 = z.infer<typeof frenchA2Schema>;
export type FrenchB1 = z.infer<typeof frenchB1Schema>;
export type FrenchB2 = z.infer<typeof frenchB2Schema>;
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
    required: ['grammarFeedback', 'vocabularyFeedback', 'textFluencyFeedback', 'totalScore', 'language', 'level'],
    additionalProperties: false
};

export type DefaultReview = z.infer<typeof defaultSchema>;

export type ReviewResult = FrenchA1 | FrenchA2 | FrenchB1 | FrenchB2 | GermanB1 | DefaultReview;

/** Fields that are not scoring criteria and should be excluded from the total score sum. */
const EXCLUDE_FROM_SUM = ['outOf', 'totalScore', 'language', 'level', 'name'];

/** Calculates the total score achieved from a review by summing all numeric scoring fields. */
export function calculateTotalScore(review: Record<string, unknown>): { achieved: number; outOf: number } {
    let achieved = 0;
    const outOf = typeof review.outOf === 'number' ? review.outOf : 100;

    for (const [key, value] of Object.entries(review)) {
        if (typeof value === 'number' && !EXCLUDE_FROM_SUM.includes(key)) {
            achieved += value;
        }
    }

    return { achieved, outOf };
}

type JsonSchemaProperty = { type?: string; default?: unknown; minimum?: number; maximum?: number; minSize?: number; maxSize?: number };
type JsonObjectSchema = { properties?: Record<string, JsonSchemaProperty> };

interface Rubric {
    name: string;
    description: string;
    systemPrompt: string;
    schemaDefinition: JsonObjectSchema;
}

function selectRubric(language: Language, level: Level): Rubric {
    if (language === Language.FRENCH) {
        switch (level) {
            case Levels.A1:
                return { name: 'frenchA1', description: 'Feedback for A1 level French learner.', systemPrompt: frenchA1(), schemaDefinition: frenchA1SchemaJson };
            case Levels.A2:
                return { name: 'frenchA2', description: 'Feedback for A2 level French learner.', systemPrompt: frenchA2(), schemaDefinition: frenchA2SchemaJson };
            case Levels.B1:
                return { name: 'frenchB1', description: 'Feedback for B1 level French learner.', systemPrompt: frenchB1(), schemaDefinition: frenchB1SchemaJson };
            case Levels.B2:
                return { name: 'frenchB2', description: 'Feedback for B2 level French learner.', systemPrompt: frenchB2(), schemaDefinition: frenchB2SchemaJson };
        }
    }
    if (language === Language.GERMAN && level === Levels.B1) {
        return { name: 'germanB1', description: 'Feedback for a B1 level German learner.', systemPrompt: germanB1(), schemaDefinition: germanB1SchemaJson };
    }
    return { name: 'default', description: 'Feedback for an unschematised language or level learner.', systemPrompt: baseline(language, level), schemaDefinition: defaultSchemaJson };
}

/**
 * Keeps model-reported scores within the rubric so a manipulated answer cannot inflate them:
 * clamps each numeric criterion to its range, drops numeric fields the rubric does not define,
 * and replaces outOf with the rubric's own maximum.
 */
export function enforceRubricLimits(review: Record<string, unknown>, schema: JsonObjectSchema): Record<string, unknown> {
    const properties = schema.properties;
    if (!properties) return review;

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(review)) {
        const property = properties[key];
        if (typeof value !== 'number') {
            result[key] = value;
            continue;
        }
        if (!property || property.type !== 'number') continue;

        const min = property.minimum ?? property.minSize;
        const max = property.maximum ?? property.maxSize;
        let clamped = value;
        if (typeof min === 'number') clamped = Math.max(min, clamped);
        if (typeof max === 'number') clamped = Math.min(max, clamped);
        result[key] = clamped;
    }

    if (typeof properties.outOf?.default === 'number') {
        result.outOf = properties.outOf.default;
    }
    return result;
}

export const reviewGeneration = async (userId: string | null, prompt: Prompt, userInput: string): Promise<JSON> => {
    const language = prompt.language as Language;
    const level = prompt.level as Level;
    const rubric = selectRubric(language, level);
    logger.debug('Generating review with rubric', rubric.name);

    const response = await mistral.chat.complete({
        model: MODEL,
        messages: [
            { role: 'system', content: rubric.systemPrompt },
            { role: 'user', content: reviewSubmission(prompt.prompt, userInput) }
        ],
        responseFormat: {
            type: 'json_schema',
            jsonSchema: {
                name: rubric.name,
                description: rubric.description,
                schemaDefinition: rubric.schemaDefinition
            }
        }
    });

    const content = response.choices?.[0]?.message?.content;
    logger.debug('Raw model response content:', content);
    if (typeof content !== 'string') {
        throw new Error(`Unexpected model response format: ${JSON.stringify(content)}`);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(content);
    } catch (err) {
        throw new Error(`Failed to parse model JSON response: ${String(err)}`);
    }

    const review = enforceRubricLimits(parsed as Record<string, unknown>, rubric.schemaDefinition);
    const { achieved, outOf } = calculateTotalScore(review);

    if (userId) {
        await responseToDatabase(
            userId,
            prompt.id,
            userInput,
            achieved,
            outOf === 0 ? 0 : Math.round((achieved / outOf * 100))
        );
    }

    return review as unknown as JSON;
}

export default reviewGeneration;