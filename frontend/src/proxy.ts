import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Enterprise Route Security Proxy (Next.js 16 convention)
 * Protects all confidential vendor dashboard and workspace routes.
 * If no valid session token cookie exists, immediately redirects to /demo/login.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Protect all dashboard routes (vendor, buyer, admin)
  if (
    pathname.startsWith('/demo/dashboard') ||
    pathname.startsWith('/dashboard')
  ) {
    const token = request.cookies.get('token')?.value;

    // If no active auth token cookie, redirect immediately to login
    if (!token) {
      const loginUrl = new URL('/demo/login', request.url);
      const fullPath = pathname + search;
      loginUrl.searchParams.set('redirect', fullPath);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/demo/dashboard/:path*',
    '/dashboard/:path*',
  ],
};
