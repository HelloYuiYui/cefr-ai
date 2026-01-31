import { Language, LanguageNames, Level, MODEL, Prompt } from "@/app/types";
import mistral from "../mistral";
import z from 'zod';
import { writingPrompt } from "./prompts";
import { promptToDatabase } from "../db";
import logger from "../logger";

export const promptResultSchema = z.object({
    id: z.number().optional(),
    prompt: z.string(),
    language: z.string(),
    topic: z.string(),
    level: z.string()
});

export type PromptResult = z.infer<typeof promptResultSchema>;

/**
 * Get a writing prompt for the given language and CEFR level.
 * @param language 
 * @param level 
 * @returns An object containing the prompt, language, and level.
 * TODO : Could simplify this?
 */
export const promptSchema = async (language: Language, level: Level): Promise<PromptResult> => {
    const languageName = LanguageNames[language];
    const prompt = await mistral.chat.complete({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: writingPrompt(level, languageName)
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

    const promptData: Prompt = {
        language: result.data.language,
        level: result.data.level,
        topic: result.data.topic,
        prompt_text: result.data.prompt,
    };

    const newPrompt = await promptToDatabase(promptData);
    logger.debug('Saved prompt with ID:', newPrompt.rows[0].id);

    result.data.id = newPrompt.rows[0].id;

    return result.data;
}

export default promptSchema;