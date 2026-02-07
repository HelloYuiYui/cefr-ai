import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware for route protection
// Note: Client-side auth check in /account/page.tsx handles the actual redirect
export async function proxy(request: NextRequest) {
    // For now, let all requests through - client-side AuthContext handles protection
    // This can be enhanced later with proper Supabase SSR auth
    return NextResponse.next();
}

export const config = {
    matcher: ['/account/:path*'],
};
