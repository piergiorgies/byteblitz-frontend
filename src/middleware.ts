import { NextRequest, NextResponse } from 'next/server';
import { extractJWTPayload } from './utils/jwt';

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const tokenWrapper = request.cookies.get('token');
    const token = tokenWrapper?.value;

    if (url.pathname.startsWith('/auth/callback')) {
        const tokenFromQuery = url.searchParams.get('token');

        if (tokenFromQuery) {
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.set({
                name: 'token',
                value: tokenFromQuery,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
            });
            return response;
        }
    }

    const decodedJwt = await extractJWTPayload(token);

    if (url.pathname.startsWith('/admin')) {
        if (decodedJwt == null || decodedJwt.user_permissions < 2) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // If it isn't redirect, it sets the user info in the request headers
    // to be retrieved faster in the page
    if (decodedJwt != null) {
        request.headers.set('X-LOGGED-USER', decodedJwt.sub ?? 'GUEST');
        request.headers.set(
            'X-LOGGED-PERMISSIONS',
            decodedJwt.user_permissions.toString(),
        );
    }

    return NextResponse.next({ request });
}

export const config = {
    matcher: ['/((?!_next|static|favicon.ico).*)'],
};
