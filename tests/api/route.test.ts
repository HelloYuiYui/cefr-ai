import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all external dependencies before importing the module under test
vi.mock('next/headers', () => ({
    cookies: vi.fn(() => Promise.resolve({
        set: vi.fn(),
        get: vi.fn()
    })),
    headers: vi.fn()
}));

vi.mock('@/lib', () => ({
    promptSchema: vi.fn(),
    readingSchema: vi.fn(),
    reviewGeneration: vi.fn(),
    checkRateLimit: vi.fn()
}));

vi.mock('@/lib/logger', () => ({
    default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));

vi.mock('@/app/context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('@/lib/db', () => ({
    getPromptById: vi.fn()
}));

vi.mock('@/lib/supabase/server', () => ({
    getUserIdFromAccessToken: vi.fn()
}));

import { GET, getWritingPrompt, getReadingPrompt, reviewAnswer, languageChange } from '@/app/api/route';
import { checkRateLimit, promptSchema, readingSchema, reviewGeneration } from '@/lib';
import { getPromptById } from '@/lib/db';
import { getUserIdFromAccessToken } from '@/lib/supabase/server';

describe('GET()', () => {
    it('returns a response with "API is running"', async () => {
        const response = await GET();
        const text = await response.text();
        expect(text).toBe('API is running');
    });
});

describe('languageChange()', () => {
    it('sets the locale cookie', async () => {
        // languageChange calls cookies().set()
        await expect(languageChange('fr')).resolves.not.toThrow();
    });
});

describe('getPrompt()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns error object when rate limited', async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ success: false });

        const result = await getWritingPrompt('fr', 'A1');
        expect(result).toEqual({
            error: 'Rate limit exceeded. Please wait a moment before trying again.'
        });
    });

    it('calls promptSchema with language and level when not rate limited', async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ success: true });
        vi.mocked(promptSchema).mockResolvedValue({
            id: '1',
            prompt: 'Write something.',
            language: 'fr',
            level: 'A1',
            topic: 'Education'
        });

        await getWritingPrompt('fr', 'A1');
        expect(promptSchema).toHaveBeenCalledWith('fr', 'A1');
    });

    it('returns Prompt object on success', async () => {
        const mockPrompt = {
            id: '1',
            prompt: 'Write something.',
            language: 'fr' as const,
            level: 'A1' as const,
            topic: 'Education'
        };
        vi.mocked(checkRateLimit).mockResolvedValue({ success: true });
        vi.mocked(promptSchema).mockResolvedValue(mockPrompt);

        const result = await getWritingPrompt('fr', 'A1');
        expect(result).toEqual(mockPrompt);
    });

    it('does not call promptSchema when rate limited', async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ success: false });

        await getWritingPrompt('de', 'B1');
        expect(promptSchema).not.toHaveBeenCalled();
    });
});

describe('getReading()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns error object when rate limited', async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ success: false });

        const result = await getReadingPrompt('de', 'B1');
        expect(result).toEqual({
            error: 'Rate limit exceeded. Please wait a moment before trying again.'
        });
    });

    it('calls readingSchema with language and level when not rate limited', async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ success: true });
        vi.mocked(readingSchema).mockResolvedValue({
            text: 'Reading text.',
            language: 'de',
            topic: 'Technology',
            level: 'B1',
            questions: []
        } as any);

        await getReadingPrompt('de', 'B1');
        expect(readingSchema).toHaveBeenCalledWith('de', 'B1');
    });

    it('returns ReadingResult object on success', async () => {
        const mockReading = {
            id: 1,
            text: 'Reading text.',
            language: 'de',
            topic: 'Technology',
            level: 'B1',
            questions: [
                { question: 'Q?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 },
                { question: 'Q?', options: ['A', 'B', 'C', 'D'], correctAnswer: 1 },
                { question: 'Q?', options: ['A', 'B', 'C', 'D'], correctAnswer: 2 },
                { question: 'Q?', options: ['A', 'B', 'C', 'D'], correctAnswer: 3 }
            ]
        };
        vi.mocked(checkRateLimit).mockResolvedValue({ success: true });
        vi.mocked(readingSchema).mockResolvedValue(mockReading as any);

        const result = await getReadingPrompt('de', 'B1');
        expect(result).toEqual(mockReading);
    });
});

describe('reviewAnswer()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(checkRateLimit).mockResolvedValue({ success: true });
        vi.mocked(getPromptById).mockResolvedValue(storedPrompt);
        vi.mocked(getUserIdFromAccessToken).mockResolvedValue(null);
        vi.mocked(reviewGeneration).mockResolvedValue({
            grammarFeedback: 'Good grammar',
            score: 10,
            outOf: 15
        } as any);
    });

    const storedPrompt = {
        id: 'prompt-1',
        prompt: 'Write something.',
        language: 'fr' as const,
        level: 'A1' as const,
        topic: 'Education'
    };

    it('returns rate limit message when rate limited', async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ success: false });

        const result = await reviewAnswer('token', 'prompt-1', 'My text');
        expect(result).toBe('Rate limit exceeded. Please wait a moment before trying again.');
        expect(reviewGeneration).not.toHaveBeenCalled();
    });

    it('rejects arguments of the wrong type', async () => {
        const invalidCalls: unknown[][] = [
            ['token', { id: 'prompt-1', prompt: 'Injected' }, 'Text'],
            ['token', '', 'Text'],
            ['token', 'prompt-1', 42],
            [{ id: 'user-2' }, 'prompt-1', 'Text'],
        ];
        for (const args of invalidCalls) {
            const result = await (reviewAnswer as (...a: unknown[]) => Promise<string>)(...args);
            expect(result).toBe('Invalid request.');
        }
        expect(getPromptById).not.toHaveBeenCalled();
        expect(reviewGeneration).not.toHaveBeenCalled();
    });

    it('loads the prompt from the database by id', async () => {
        await reviewAnswer(null, 'prompt-1', 'My input text');

        expect(getPromptById).toHaveBeenCalledWith('prompt-1');
        expect(reviewGeneration).toHaveBeenCalledWith(null, storedPrompt, 'My input text');
    });

    it('returns an error and skips review when the prompt does not exist', async () => {
        vi.mocked(getPromptById).mockResolvedValue(null);

        const result = await reviewAnswer(null, 'missing', 'Text');
        expect(result).toBe('Prompt not found.');
        expect(reviewGeneration).not.toHaveBeenCalled();
    });

    it('returns an error when the prompt lookup fails', async () => {
        vi.mocked(getPromptById).mockRejectedValue(new Error('invalid input syntax for type uuid'));

        const result = await reviewAnswer(null, 'not-a-uuid', 'Text');
        expect(result).toBe('Prompt not found.');
        expect(reviewGeneration).not.toHaveBeenCalled();
    });

    it('uses the user id verified from the access token', async () => {
        vi.mocked(getUserIdFromAccessToken).mockResolvedValue('verified-user');

        await reviewAnswer('valid-token', 'prompt-1', 'Text');

        expect(getUserIdFromAccessToken).toHaveBeenCalledWith('valid-token');
        expect(reviewGeneration).toHaveBeenCalledWith('verified-user', storedPrompt, 'Text');
    });

    it('treats anonymous and invalid tokens as no user', async () => {
        await reviewAnswer(null, 'prompt-1', 'Text');
        await reviewAnswer('forged-token', 'prompt-1', 'Text');

        expect(reviewGeneration).toHaveBeenNthCalledWith(1, null, storedPrompt, 'Text');
        expect(reviewGeneration).toHaveBeenNthCalledWith(2, null, storedPrompt, 'Text');
    });

    it('returns formatted string from stringifyReview', async () => {
        const result = await reviewAnswer(null, 'prompt-1', 'Text');

        expect(typeof result).toBe('string');
        expect(result).toContain('grammarFeedback');
        expect(result).toContain('totalScore:');
    });
});
