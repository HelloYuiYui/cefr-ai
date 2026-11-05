import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCookieGet } = vi.hoisted(() => ({ mockCookieGet: vi.fn() }));

vi.mock('next/headers', () => ({
    cookies: vi.fn(() => Promise.resolve({ get: mockCookieGet }))
}));

vi.mock('next-intl/server', () => ({
    getRequestConfig: (fn: unknown) => fn
}));

import getConfig from '@/app/i18n/request';

const loadConfig = getConfig as unknown as () => Promise<{ locale: string; messages: Record<string, unknown> }>;

describe('i18n request config', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uses a supported locale from the cookie', async () => {
        mockCookieGet.mockReturnValue({ value: 'fr' });

        const config = await loadConfig();
        expect(config.locale).toBe('fr');
        expect(config.messages).toBeTypeOf('object');
    });

    it('falls back to the default locale for unsupported values', async () => {
        for (const value of ['es', '../../package', 'de/../en', '']) {
            mockCookieGet.mockReturnValue({ value });
            expect((await loadConfig()).locale).toBe('de');
        }
    });

    it('falls back to the default locale when there is no cookie', async () => {
        mockCookieGet.mockReturnValue(undefined);
        expect((await loadConfig()).locale).toBe('de');
    });
});
