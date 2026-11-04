import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from '../logger';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
    client ??= createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
    );
    return client;
}

/**
 * Verifies a Supabase access token with Supabase Auth and returns the user's id.
 * @param accessToken - Access token from the client's Supabase session
 * @returns The verified user id, or null if there is no token or it is invalid
 */
export async function getUserIdFromAccessToken(accessToken: string | null | undefined): Promise<string | null> {
    if (!accessToken) return null;

    const { data, error } = await getClient().auth.getUser(accessToken);
    if (error || !data.user) {
        logger.warn('Rejected invalid access token:', error?.message);
        return null;
    }
    return data.user.id;
}
