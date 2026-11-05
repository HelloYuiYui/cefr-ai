import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetUser } = vi.hoisted(() => ({
    mockGetUser: vi.fn()
}));

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({ auth: { getUser: mockGetUser } }))
}));

vi.mock('@/lib/logger', () => ({
    default: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));

import { getUserIdFromAccessToken } from '@/lib/supabase/server';

describe('getUserIdFromAccessToken()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns null without calling Supabase when there is no token', async () => {
        expect(await getUserIdFromAccessToken(null)).toBeNull();
        expect(await getUserIdFromAccessToken('')).toBeNull();
        expect(mockGetUser).not.toHaveBeenCalled();
    });

    it('returns the verified user id for a valid token', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

        expect(await getUserIdFromAccessToken('valid-token')).toBe('user-1');
        expect(mockGetUser).toHaveBeenCalledWith('valid-token');
    });

    it('returns null when Supabase rejects the token', async () => {
        mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid JWT' } });

        expect(await getUserIdFromAccessToken('forged-token')).toBeNull();
    });
});
