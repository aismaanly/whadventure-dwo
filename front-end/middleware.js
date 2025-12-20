import { NextResponse } from 'next/server';

export function middleware(request) {
  const isLoggedIn = request.cookies.get('isLoggedIn');
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/home', '/fact-sales', '/fact-production', '/external'];
  const isProtectedPage = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};