import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/session-token';

export async function middleware(request: NextRequest) {
  // Middleware runs on the Edge runtime, so avoid server-only modules (e.g., Prisma/pg).
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = request.nextUrl;

  // Public routes yang tidak perlu auth
  const isPublicRoute =
    pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/public');

  // Jika belum login dan akses protected route
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan akses login page
  if (session && (pathname === '/login' || pathname === '/')) {
    const queueUrl = new URL('/queue', request.url);
    return NextResponse.redirect(queueUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
