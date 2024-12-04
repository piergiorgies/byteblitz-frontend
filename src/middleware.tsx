import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    // TODO!!!!
    // IMPLEMENT AUTH BASED ON TOKEN IN COOKIES

    // console.log(request.cookies.get('byteblitz_token'))
    // console.log(request.nextUrl.pathname);
    // return NextResponse.redirect(request.url);
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|static|favicon.ico).*)'],
};
