import { NextRequest, NextResponse } from 'next/server';
import { extractJWTPayload } from './utils/jwt';

export async function middleware(request: NextRequest) {
    const tokenWrapper = request.cookies.get('token');
    const token = tokenWrapper?.value;
    const decodedJwt = await extractJWTPayload(token);

    if(request.nextUrl.pathname.startsWith('/admin')) {
        if(decodedJwt == null || decodedJwt.user_permissions < 2) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // If it isn't redirect, it sets the user info in the request headers
    // to be retrieved faster in the page
    if(decodedJwt != null) {
        request.headers.set('X-LOGGED-USER', decodedJwt.sub ?? 'GUEST');
        request.headers.set('X-LOGGED-PERMISSIONS', decodedJwt.user_permissions.toString());
    }

    return NextResponse.next({ request });
}

export const config = {
    matcher: ['/((?!_next|static|favicon.ico).*)'],
};
