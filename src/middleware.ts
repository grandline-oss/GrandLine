import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Server-Side Route Guard Middleware
 * Enforces authentication on all /admin/* routes prior to page rendering.
 * Exempts the /admin/login authentication gateway.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes, exempting login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('grandline_admin_session');

    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
