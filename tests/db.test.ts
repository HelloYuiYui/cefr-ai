import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the pg module - use vi.hoisted() so the mock fn is available before vi.mock hoists
const { mockQuery } = vi.hoisted(() => ({
    mockQuery: vi.fn()
}));

vi.mock('pg', () => ({
    default: {
        Pool: vi.fn(() => ({
            query: mockQuery
        }))
    }
}));

import {
    query,
    promptToDatabase,
    responseToDatabase,
    readingTextToDatabase,
    readingResponseToDatabase
} from '@/lib/db';

describe('query()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls pool.query with text and params', async () => {
        mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });

        await query('SELECT * FROM users WHERE id = $1', [1]);

        expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
    });

    it('returns query result', async () => {
        const mockResult = { rows: [{ id: 1, name: 'test' }], rowCount: 1 };
        mockQuery.mockResolvedValue(mockResult);

        const result = await query('SELECT * FROM users');

        expect(result).toEqual(mockResult);
    });

    it('calls pool.query without params when not provided', async () => {
        mockQuery.mockResolvedValue({ rows: [] });

        await query('SELECT 1');

        expect(mockQuery).toHaveBeenCalledWith('SELECT 1', undefined);
    });
});

describe('promptToDatabase()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('inserts prompt with correct SQL and values', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 42 }] });

        const prompt = {
            id: 'temp',
            language: 'fr' as const,
            topic: 'Education',
            level: 'A1' as const,
            prompt: 'Write about school.'
        };

        await promptToDatabase(prompt);

        expect(mockQuery).toHaveBeenCalledOnce();
        const [sql, values] = mockQuery.mock.calls[0];
        expect(sql).toContain('INSERT INTO prompts');
        expect(sql).toContain('RETURNING id');
        expect(values).toEqual(['fr', 'Education', 'A1', 'Write about school.']);
    });

    it('maps prompt fields to $1-$4 in correct order', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

        const prompt = {
            id: 'temp',
            language: 'de' as const,
            topic: 'Technology',
            level: 'B1' as const,
            prompt: 'Describe technology.'
        };

        await promptToDatabase(prompt);

        const [, values] = mockQuery.mock.calls[0];
        expect(values[0]).toBe('de');        // language
        expect(values[1]).toBe('Technology'); // topic
        expect(values[2]).toBe('B1');        // level
        expect(values[3]).toBe('Describe technology.'); // prompt_text
    });

    it('returns result with RETURNING id', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 99 }], oid: 99 });

        const prompt = {
            id: 'temp',
            language: 'en' as const,
            topic: 'Culture',
            level: 'B2' as const,
            prompt: 'Write about art.'
        };

        const result = await promptToDatabase(prompt);

        expect(result.rows[0].id).toBe(99);
    });
});

describe('responseToDatabase()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('inserts response with all fields', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

        await responseToDatabase('user-1', 'prompt-1', 'My response text', 15, 80, { source: 'web' });

        expect(mockQuery).toHaveBeenCalledOnce();
        const [sql, values] = mockQuery.mock.calls[0];
        expect(sql).toContain('INSERT INTO responses');
        expect(sql).toContain('RETURNING id');
        expect(values[0]).toBe('user-1');
        expect(values[1]).toBe('prompt-1');
        expect(values[2]).toBe('My response text');
        expect(values[3]).toBe(15);
        expect(values[4]).toBe(80);
        expect(values[5]).toBe(JSON.stringify({ source: 'web' }));
    });

    it('handles optional grade/gradePercentage as null', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

        await responseToDatabase('user-1', 'prompt-1', 'My response');

        const [, values] = mockQuery.mock.calls[0];
        expect(values[3]).toBeNull();  // grade
        expect(values[4]).toBeNull();  // gradePercentage
    });

    it('stringifies metadata as JSON when provided', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

        const metadata = { key: 'value', nested: { a: 1 } };
        await responseToDatabase('user-1', 'prompt-1', 'Text', 10, 67, metadata);

        const [, values] = mockQuery.mock.calls[0];
        expect(values[5]).toBe(JSON.stringify(metadata));
    });

    it('passes null for metadata when not provided', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

        await responseToDatabase('user-1', 'prompt-1', 'Text', 10, 67);

        const [, values] = mockQuery.mock.calls[0];
        expect(values[5]).toBeNull();
    });
});

describe('readingTextToDatabase()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('inserts reading text with stringified questions', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 5 }] });

        const questions = [
            { question: 'Q?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 }
        ];
        const reading = {
            language: 'German',
            topic: 'Technology',
            level: 'B1',
            text: 'A reading passage.',
            questions
        };

        await readingTextToDatabase(reading);

        expect(mockQuery).toHaveBeenCalledOnce();
        const [sql, values] = mockQuery.mock.calls[0];
        expect(sql).toContain('INSERT INTO reading_texts');
        expect(sql).toContain('RETURNING id');
        expect(values[4]).toBe(JSON.stringify(questions));
    });

    it('maps reading fields to correct SQL positions', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

        const reading = {
            language: 'French',
            topic: 'Culture',
            level: 'A2',
            text: 'Le texte.',
            questions: []
        };

        await readingTextToDatabase(reading);

        const [, values] = mockQuery.mock.calls[0];
        expect(values[0]).toBe('French');   // language
        expect(values[1]).toBe('Culture');  // topic
        expect(values[2]).toBe('A2');       // level
        expect(values[3]).toBe('Le texte.'); // text (prompt_text column)
        expect(values[4]).toBe('[]');       // questions as JSON string
    });
});

describe('readingResponseToDatabase()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('inserts reading response with correct values', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

        await readingResponseToDatabase('prompt-5', 'User answer text');

        expect(mockQuery).toHaveBeenCalledOnce();
        const [sql, values] = mockQuery.mock.calls[0];
        expect(sql).toContain('INSERT INTO reading_responses');
        expect(sql).toContain('RETURNING id');
        expect(values[0]).toBe('prompt-5');
        expect(values[1]).toBe('User answer text');
    });

    it('handles optional metadata', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

        const metadata = { score: 3, total: 4 };
        await readingResponseToDatabase('prompt-5', 'Answer', metadata);

        const [, values] = mockQuery.mock.calls[0];
        expect(values[2]).toBe(JSON.stringify(metadata));
    });

    it('passes null for metadata when not provided', async () => {
        mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

        await readingResponseToDatabase('prompt-5', 'Answer');

        const [, values] = mockQuery.mock.calls[0];
        expect(values[2]).toBeNull();
    });
});
