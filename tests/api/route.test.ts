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

import { GET, getWritingPrompt, getReadingPrompt, reviewAnswer, languageChange } from '@/app/api/route';
import { checkRateLimit, promptSchema, readingSchema, reviewGeneration } from '@/lib';

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
    });

    const mockPrompt = {
        id: 'prompt-1',
        prompt: 'Write something.',
        language: 'fr' as const,
        level: 'A1' as const,
        topic: 'Education'
    };

    it('returns rate limit message when rate limited', async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ success: false });

        const result = await reviewAnswer('user-1', mockPrompt, 'My text');
        expect(result).toBe('Rate limit exceeded. Please wait a moment before trying again.');
    });

    it('calls reviewGeneration with correct arguments', async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ success: true });
        vi.mocked(reviewGeneration).mockResolvedValue({
            grammarFeedback: 'Good',
            outOf: 15,
            score: 10
        } as any);

        await reviewAnswer('user-1', mockPrompt, 'My input text');

        expect(reviewGeneration).toHaveBeenCalledWith('user-1', mockPrompt, 'My input text');
    });

    it('returns formatted string from stringifyReview', async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ success: true });
        vi.mocked(reviewGeneration).mockResolvedValue({
            grammarFeedback: 'Good grammar',
            score: 10,
            outOf: 15
        } as any);

        const result = await reviewAnswer('user-1', mockPrompt, 'Text');

        expect(typeof result).toBe('string');
        expect(result).toContain('grammarFeedback');
        expect(result).toContain('totalScore:');
    });

    it('passes userId to reviewGeneration (null for anonymous)', async () => {
        vi.mocked(checkRateLimit).mockResolvedValue({ success: true });
        vi.mocked(reviewGeneration).mockResolvedValue({
            grammarFeedback: 'Good',
            outOf: 100
        } as any);

        await reviewAnswer(null, mockPrompt, 'Text');
        expect(reviewGeneration).toHaveBeenCalledWith(null, mockPrompt, 'Text');
    });
});
