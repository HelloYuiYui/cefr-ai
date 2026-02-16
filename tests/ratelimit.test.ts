import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted() so mock fns are available before vi.mock hoists
const { mockLimit, mockHeadersGet } = vi.hoisted(() => ({
    mockLimit: vi.fn(),
    mockHeadersGet: vi.fn()
}));

vi.mock('@upstash/redis', () => ({
    Redis: vi.fn(() => ({}))
}));

vi.mock('@upstash/ratelimit', () => ({
    Ratelimit: Object.assign(
        vi.fn(() => ({
            limit: mockLimit
        })),
        {
            slidingWindow: vi.fn()
        }
    )
}));

vi.mock('next/headers', () => ({
    headers: vi.fn(() => Promise.resolve({
        get: mockHeadersGet
    }))
}));

import { checkRateLimit, withRateLimit } from '@/lib/ratelimit';

describe('checkRateLimit()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('extracts IP from x-forwarded-for header', async () => {
        mockHeadersGet.mockImplementation((key: string) => {
            if (key === 'x-forwarded-for') return '192.168.1.1';
            return null;
        });
        mockLimit.mockResolvedValue({ success: true });

        await checkRateLimit();

        expect(mockLimit).toHaveBeenCalledWith('192.168.1.1');
    });

    it('falls back to x-real-ip when x-forwarded-for missing', async () => {
        mockHeadersGet.mockImplementation((key: string) => {
            if (key === 'x-forwarded-for') return null;
            if (key === 'x-real-ip') return '10.0.0.1';
            return null;
        });
        mockLimit.mockResolvedValue({ success: true });

        await checkRateLimit();

        expect(mockLimit).toHaveBeenCalledWith('10.0.0.1');
    });

    it('falls back to anonymous when both headers missing', async () => {
        mockHeadersGet.mockReturnValue(null);
        mockLimit.mockResolvedValue({ success: true });

        await checkRateLimit();

        expect(mockLimit).toHaveBeenCalledWith('anonymous');
    });

    it('returns { success: true } when under limit', async () => {
        mockHeadersGet.mockReturnValue('1.2.3.4');
        mockLimit.mockResolvedValue({ success: true, reset: undefined });

        const result = await checkRateLimit();

        expect(result.success).toBe(true);
    });

    it('returns { success: false, reset } when over limit', async () => {
        const resetTime = Date.now() + 60000;
        mockHeadersGet.mockReturnValue('1.2.3.4');
        mockLimit.mockResolvedValue({ success: false, reset: resetTime });

        const result = await checkRateLimit();

        expect(result.success).toBe(false);
        expect(result.reset).toBe(resetTime);
    });
});

describe('withRateLimit()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockHeadersGet.mockReturnValue('1.2.3.4');
    });

    it('calls wrapped function when under limit', async () => {
        mockLimit.mockResolvedValue({ success: true });
        const fn = vi.fn().mockResolvedValue('result');

        const wrapped = withRateLimit(fn);
        const result = await wrapped();

        expect(fn).toHaveBeenCalled();
        expect(result).toBe('result');
    });

    it('throws error when over limit', async () => {
        const resetTime = Date.now() + 60000;
        mockLimit.mockResolvedValue({ success: false, reset: resetTime });
        const fn = vi.fn();

        const wrapped = withRateLimit(fn);

        await expect(wrapped()).rejects.toThrow('Rate limit exceeded');
    });

    it('includes reset date in error message', async () => {
        const resetTime = Date.now() + 60000;
        mockLimit.mockResolvedValue({ success: false, reset: resetTime });
        const fn = vi.fn();

        const wrapped = withRateLimit(fn);

        await expect(wrapped()).rejects.toThrow(new Date(resetTime).toISOString());
    });

    it('passes through all arguments to wrapped function', async () => {
        mockLimit.mockResolvedValue({ success: true });
        const fn = vi.fn().mockResolvedValue('done');

        const wrapped = withRateLimit(fn);
        await wrapped('arg1', 'arg2', 42);

        expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 42);
    });

    it('returns wrapped function return value', async () => {
        mockLimit.mockResolvedValue({ success: true });
        const fn = vi.fn().mockResolvedValue({ data: 'test' });

        const wrapped = withRateLimit(fn);
        const result = await wrapped();

        expect(result).toEqual({ data: 'test' });
    });
});
