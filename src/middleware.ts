import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Define public pages
  const publicPaths = [
    '/login', '/register', '/contact', '/investment', '/news',
    '/api/auth/login', '/api/auth/register', '/api/auth/me',
    '/api/personal-analyses', '/api/news'
  ];
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // If no token, only allow public pages
  if (!token) {
    if (path === '/contact' || path === '/investment' || path === '/personal-analyses' || path === '/news') return NextResponse.next();
    if ((path.startsWith('/api/personal-analyses') || path.startsWith('/api/news')) && request.method === 'GET') {
      return NextResponse.next(); // Allow public read access
    }
    if (path.startsWith('/api')) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token and get role
  let userRole = 'visitor';
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jwtVerify(token, secret);
    userRole = payload.role || 'visitor';
  } catch {
    if (path.startsWith('/api')) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin-only pages
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    if (userRole !== 'admin') {
      if (path.startsWith('/api')) {
        return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Member or admin pages
  const memberOrAdminPaths = [
    '/', '/backtests'
  ];
  const memberOrAdminApi = [
    '/api/backtests'
  ];
  if (
    memberOrAdminPaths.includes(path) ||
    memberOrAdminApi.some(apiPath => path.startsWith(apiPath))
  ) {
    if (userRole === 'visitor') {
      if (path.startsWith('/api')) {
        return NextResponse.json({ message: 'Member access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/contact', request.url));
    }
    return NextResponse.next();
  }

  // All other pages: allow if authenticated
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 