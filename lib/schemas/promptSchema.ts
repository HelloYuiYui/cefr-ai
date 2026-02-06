import { Language, LanguageNames, Level, MODEL, Prompt, Reading } from "@/app/types";
import mistral from "../mistral";
import z from 'zod';
import { writingPrompt } from "./prompts";
import { promptToDatabase, readingTextToDatabase } from "../db";
import logger from "../logger";

export const promptResultSchema = z.object({
    id: z.number().optional(),
    prompt: z.string(),
    language: z.string(),
    topic: z.string(),
    level: z.string()
});

export type PromptResult = z.infer<typeof promptResultSchema>;

export const questionSchema = z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswer: z.number().min(0).max(3)
});

export const readingResultSchema = z.object({
    id: z.number().optional(),
    text: z.string(),
    language: z.string(),
    topic: z.string(),
    level: z.string(),
    questions: z.array(questionSchema).length(4)
});

export type QuestionResult = z.infer<typeof questionSchema>;
export type ReadingResult = z.infer<typeof readingResultSchema>;

export const TOPICS = [
    'Contemporary society',
    'Environment and ecology',
    'Work and employment',
    'Consumption and economy',
    'Education',
    'Culture',
    'Technology',
    'Public health',
    'Media and communication',
    'Family and social relations',
    'Urban life and management',
    'Food, eating, and cooking',
    'Tourism and travelling',
    'Languages and the language sphere'
] as const;

/**
 * Get a writing prompt for the given language and CEFR level.
 * @param language 
 * @param level 
 * @returns An object containing the prompt, language, and level.
 * TODO : Could simplify this?
 */
export const promptSchema = async (language: Language, level: Level): Promise<Prompt> => {
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const languageName = LanguageNames[language];
    const prompt = await mistral.chat.complete({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: writingPrompt(level, languageName, randomTopic)
            }
        ],
        responseFormat: { 
            type: 'json_schema', 
            jsonSchema: {
                name: 'prompt',
                description: 'A writing prompt for language learners.',
                schemaDefinition: {
                    type: 'object',
                    properties: {
                        prompt: { type: 'string' },
                        language: { type: 'string' },
                        topic: { type: 'string' },
                        level: { type: 'string' }
                    },
                    required: ['prompt', 'language', 'level', 'topic'],
                    additionalProperties: false
                }
            }
        },
        temperature: 1.2
    })
    const content = prompt.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
        throw new Error(`Unexpected model response format: ${JSON.stringify(content)}`);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(content);
    } catch (err) {
        throw new Error(`Failed to parse model JSON response: ${String(err)}`);
    }

    const result = promptResultSchema.safeParse(parsed);
    if (!result.success) {
        throw new Error(`Model returned invalid prompt schema: ${JSON.stringify(result.error.errors)}`);
    }

    const promptResponse: Prompt = {
        id: prompt.id, 
        language: language,
        level: level,
        topic: result.data.topic,
        prompt: result.data.prompt,
    };

    const newPrompt = await promptToDatabase(promptResponse);
    logger.debug('Saved prompt with ID:', newPrompt.oid);

    result.data.id = newPrompt.oid;
    promptResponse.id = newPrompt.rows[0].id;

    return promptResponse;
}

/**
 * Get a reading comprehension text with questions for the given language and CEFR level.
 * @param language
 * @param level
 * @returns An object containing the reading text, questions, language, and level.
 */
export const readingSchema = async (language: Language, level: Level): Promise<ReadingResult> => {
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const languageName = LanguageNames[language];
    const { readingPrompt } = await import("./prompts");

    const prompt = await mistral.chat.complete({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: readingPrompt(level, languageName, randomTopic)
            }
        ],
        responseFormat: {
            type: 'json_schema',
            jsonSchema: {
                name: 'reading',
                description: 'A reading comprehension text with questions for language learners.',
                schemaDefinition: {
                    type: 'object',
                    properties: {
                        text: { type: 'string' },
                        language: { type: 'string' },
                        topic: { type: 'string' },
                        level: { type: 'string' },
                        questions: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    question: { type: 'string' },
                                    options: {
                                        type: 'array',
                                        items: { type: 'string' },
                                        minItems: 4,
                                        maxItems: 4
                                    },
                                    correctAnswer: {
                                        type: 'number',
                                        minimum: 0,
                                        maximum: 3
                                    }
                                },
                                required: ['question', 'options', 'correctAnswer'],
                                additionalProperties: false
                            },
                            minItems: 4,
                            maxItems: 4
                        }
                    },
                    required: ['text', 'language', 'level', 'topic', 'questions'],
                    additionalProperties: false
                }
            }
        },
        temperature: 1.5
    });

    const content = prompt.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
        throw new Error(`Unexpected model response format: ${JSON.stringify(content)}`);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(content);
    } catch (err) {
        throw new Error(`Failed to parse model JSON response: ${String(err)}`);
    }

    const result = readingResultSchema.safeParse(parsed);
    if (!result.success) {
        throw new Error(`Model returned invalid reading schema: ${JSON.stringify(result.error.errors)}`);
    }

    const readingData: Reading = {
        language: LanguageNames[result.data.language],
        level: result.data.level,
        topic: result.data.topic,
        text: result.data.text,
        questions: result.data.questions,
    };

    const newReading = await readingTextToDatabase(readingData);
    logger.debug('Saved reading text with ID:', newReading.rows[0].id);

    result.data.id = newReading.rows[0].id;

    return result.data;
}

export default promptSchema;