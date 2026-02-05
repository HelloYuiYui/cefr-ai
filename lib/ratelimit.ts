import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';

// Rate limiter configuration: 10 requests per 60 seconds per IP
const RATE_LIMIT_REQUESTS = 1;
const RATE_LIMIT_WINDOW = '60 s';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW),
    analytics: true,
    prefix: 'cefr-ratelimit',
});

/**
 * Checks if the current request is within rate limits based on client IP.
 * @returns Object with success status and reset time if rate limited
 */
export async function checkRateLimit(): Promise<{ success: boolean; reset?: number }> {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') ??
               headersList.get('x-real-ip') ??
               'anonymous';

    const { success, reset } = await ratelimit.limit(ip);

    return { success, reset };
}

/**
 * Wraps an async function with rate limiting, throwing an error if limit exceeded.
 * @param fn - The async function to wrap
 * @returns The wrapped function that checks rate limits before execution
 */
export function withRateLimit<T extends (...args: Parameters<T>) => Promise<ReturnType<T>>>(
    fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const { success, reset } = await checkRateLimit();

        if (!success) {
            const resetDate = reset ? new Date(reset).toISOString() : 'unknown';
            throw new Error(`Rate limit exceeded. Try again after ${resetDate}`);
        }

        return fn(...args);
    };
}

export { ratelimit };
