import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    promptResultSchema,
    questionSchema,
    readingResultSchema,
    TOPICS,
    promptSchema,
    readingSchema
} from '@/lib/schemas/promptSchema';

// Mock external dependencies
vi.mock('@/lib/mistral', () => ({
    default: {
        chat: {
            complete: vi.fn()
        }
    }
}));

vi.mock('@/lib/db', () => ({
    promptToDatabase: vi.fn(),
    readingTextToDatabase: vi.fn()
}));

vi.mock('@/lib/logger', () => ({
    default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));

import mistral from '@/lib/mistral';
import { promptToDatabase, readingTextToDatabase } from '@/lib/db';

describe('promptResultSchema', () => {
    it('accepts valid prompt with all fields', () => {
        const result = promptResultSchema.safeParse({
            id: 1,
            prompt: 'Write about your day.',
            language: 'fr',
            topic: 'Daily routines',
            level: 'A1'
        });
        expect(result.success).toBe(true);
    });

    it('accepts prompt without optional id', () => {
        const result = promptResultSchema.safeParse({
            prompt: 'Write about your day.',
            language: 'fr',
            topic: 'Daily routines',
            level: 'A1'
        });
        expect(result.success).toBe(true);
    });

    it('rejects missing prompt string', () => {
        const result = promptResultSchema.safeParse({
            language: 'fr',
            topic: 'Daily routines',
            level: 'A1'
        });
        expect(result.success).toBe(false);
    });

    it('rejects missing language', () => {
        const result = promptResultSchema.safeParse({
            prompt: 'Write about your day.',
            topic: 'Daily routines',
            level: 'A1'
        });
        expect(result.success).toBe(false);
    });

    it('rejects missing topic', () => {
        const result = promptResultSchema.safeParse({
            prompt: 'Write about your day.',
            language: 'fr',
            level: 'A1'
        });
        expect(result.success).toBe(false);
    });
});

describe('questionSchema', () => {
    const validQuestion = {
        question: 'What is the main idea?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 2
    };

    it('accepts valid question with 4 options and correctAnswer 0-3', () => {
        const result = questionSchema.safeParse(validQuestion);
        expect(result.success).toBe(true);
    });

    it('accepts correctAnswer of 0', () => {
        const result = questionSchema.safeParse({ ...validQuestion, correctAnswer: 0 });
        expect(result.success).toBe(true);
    });

    it('accepts correctAnswer of 3', () => {
        const result = questionSchema.safeParse({ ...validQuestion, correctAnswer: 3 });
        expect(result.success).toBe(true);
    });

    it('rejects fewer than 4 options', () => {
        const result = questionSchema.safeParse({
            ...validQuestion,
            options: ['A', 'B', 'C']
        });
        expect(result.success).toBe(false);
    });

    it('rejects more than 4 options', () => {
        const result = questionSchema.safeParse({
            ...validQuestion,
            options: ['A', 'B', 'C', 'D', 'E']
        });
        expect(result.success).toBe(false);
    });

    it('rejects correctAnswer below 0', () => {
        const result = questionSchema.safeParse({
            ...validQuestion,
            correctAnswer: -1
        });
        expect(result.success).toBe(false);
    });

    it('rejects correctAnswer above 3', () => {
        const result = questionSchema.safeParse({
            ...validQuestion,
            correctAnswer: 4
        });
        expect(result.success).toBe(false);
    });

    it('rejects missing question text', () => {
        const { question, ...withoutQuestion } = validQuestion;
        const result = questionSchema.safeParse(withoutQuestion);
        expect(result.success).toBe(false);
    });
});

describe('readingResultSchema', () => {
    const validQuestion = {
        question: 'What is the main idea?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0
    };

    const validReading = {
        text: 'This is a reading passage about technology.',
        language: 'en',
        topic: 'Technology',
        level: 'B1',
        questions: [validQuestion, validQuestion, validQuestion, validQuestion]
    };

    it('accepts valid reading with 4 questions', () => {
        const result = readingResultSchema.safeParse(validReading);
        expect(result.success).toBe(true);
    });

    it('rejects fewer than 4 questions', () => {
        const result = readingResultSchema.safeParse({
            ...validReading,
            questions: [validQuestion, validQuestion, validQuestion]
        });
        expect(result.success).toBe(false);
    });

    it('rejects more than 4 questions', () => {
        const result = readingResultSchema.safeParse({
            ...validReading,
            questions: [validQuestion, validQuestion, validQuestion, validQuestion, validQuestion]
        });
        expect(result.success).toBe(false);
    });

    it('accepts optional id field', () => {
        const result = readingResultSchema.safeParse({
            ...validReading,
            id: 42
        });
        expect(result.success).toBe(true);
    });

    it('rejects missing text field', () => {
        const { text, ...withoutText } = validReading;
        const result = readingResultSchema.safeParse(withoutText);
        expect(result.success).toBe(false);
    });

    it('rejects missing language field', () => {
        const { language, ...withoutLang } = validReading;
        const result = readingResultSchema.safeParse(withoutLang);
        expect(result.success).toBe(false);
    });
});

describe('TOPICS', () => {
    it('contains exactly 14 topics', () => {
        expect(TOPICS).toHaveLength(14);
    });

    it('all topics are non-empty strings', () => {
        for (const topic of TOPICS) {
            expect(typeof topic).toBe('string');
            expect(topic.length).toBeGreaterThan(0);
        }
    });

    it('includes known topics', () => {
        expect(TOPICS).toContain('Technology');
        expect(TOPICS).toContain('Education');
        expect(TOPICS).toContain('Culture');
    });
});

describe('promptSchema()', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockPromptResponse = {
        id: 'chat-123',
        choices: [{
            message: {
                content: JSON.stringify({
                    prompt: 'Write about your daily routine.',
                    language: 'French',
                    topic: 'Daily routines',
                    level: 'A1'
                })
            }
        }]
    };

    it('calls Mistral API with correct parameters', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue(mockPromptResponse as any);
        vi.mocked(promptToDatabase).mockResolvedValue({ rows: [{ id: 1 }], oid: 1 } as any);

        await promptSchema('fr', 'A1');

        expect(mistral.chat.complete).toHaveBeenCalledOnce();
        const callArgs = vi.mocked(mistral.chat.complete).mock.calls[0][0];
        expect(callArgs.messages[0].role).toBe('system');
        expect(callArgs.responseFormat.type).toBe('json_schema');
    });

    it('parses valid JSON response and returns Prompt object', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue(mockPromptResponse as any);
        vi.mocked(promptToDatabase).mockResolvedValue({ rows: [{ id: 42 }], oid: 42 } as any);

        const result = await promptSchema('fr', 'A1');

        expect(result).toHaveProperty('prompt');
        expect(result).toHaveProperty('language', 'fr');
        expect(result).toHaveProperty('level', 'A1');
    });

    it('saves prompt to database via promptToDatabase', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue(mockPromptResponse as any);
        vi.mocked(promptToDatabase).mockResolvedValue({ rows: [{ id: 1 }], oid: 1 } as any);

        await promptSchema('fr', 'A1');

        expect(promptToDatabase).toHaveBeenCalledOnce();
    });

    it('returns prompt with database ID', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue(mockPromptResponse as any);
        vi.mocked(promptToDatabase).mockResolvedValue({ rows: [{ id: 99 }], oid: 99 } as any);

        const result = await promptSchema('de', 'B1');
        expect(result.id).toBe(99);
    });

    it('throws on non-string model response', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue({
            choices: [{ message: { content: null } }]
        } as any);

        await expect(promptSchema('fr', 'A1')).rejects.toThrow('Unexpected model response format');
    });

    it('throws on invalid JSON from model', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue({
            choices: [{ message: { content: 'not valid json{' } }]
        } as any);

        await expect(promptSchema('fr', 'A1')).rejects.toThrow('Failed to parse model JSON response');
    });

    it('throws on schema validation failure', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue({
            choices: [{ message: { content: JSON.stringify({ invalid: 'data' }) } }]
        } as any);

        await expect(promptSchema('fr', 'A1')).rejects.toThrow('Model returned invalid prompt schema');
    });
});

describe('readingSchema()', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockReadingResponse = {
        choices: [{
            message: {
                content: JSON.stringify({
                    text: 'Eine kurze Geschichte über Technologie.',
                    language: 'de',
                    topic: 'Technology',
                    level: 'B1',
                    questions: [
                        { question: 'Q1?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 },
                        { question: 'Q2?', options: ['A', 'B', 'C', 'D'], correctAnswer: 1 },
                        { question: 'Q3?', options: ['A', 'B', 'C', 'D'], correctAnswer: 2 },
                        { question: 'Q4?', options: ['A', 'B', 'C', 'D'], correctAnswer: 3 }
                    ]
                })
            }
        }]
    };

    it('parses valid reading response with 4 questions', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue(mockReadingResponse as any);
        vi.mocked(readingTextToDatabase).mockResolvedValue({ rows: [{ id: 1 }] } as any);

        const result = await readingSchema('de', 'B1');

        expect(result).toHaveProperty('text');
        expect(result.questions).toHaveLength(4);
    });

    it('saves reading to database via readingTextToDatabase', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue(mockReadingResponse as any);
        vi.mocked(readingTextToDatabase).mockResolvedValue({ rows: [{ id: 5 }] } as any);

        await readingSchema('de', 'B1');

        expect(readingTextToDatabase).toHaveBeenCalledOnce();
    });

    it('returns ReadingResult with database ID', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue(mockReadingResponse as any);
        vi.mocked(readingTextToDatabase).mockResolvedValue({ rows: [{ id: 77 }] } as any);

        const result = await readingSchema('de', 'B1');
        expect(result.id).toBe(77);
    });

    it('throws on non-string model response', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue({
            choices: [{ message: { content: null } }]
        } as any);

        await expect(readingSchema('de', 'B1')).rejects.toThrow('Unexpected model response format');
    });

    it('throws on invalid JSON from model', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue({
            choices: [{ message: { content: '{bad json' } }]
        } as any);

        await expect(readingSchema('de', 'B1')).rejects.toThrow('Failed to parse model JSON response');
    });

    it('throws on schema validation failure', async () => {
        vi.mocked(mistral.chat.complete).mockResolvedValue({
            choices: [{ message: { content: JSON.stringify({ text: 'hello' }) } }]
        } as any);

        await expect(readingSchema('de', 'B1')).rejects.toThrow('Model returned invalid reading schema');
    });
});
