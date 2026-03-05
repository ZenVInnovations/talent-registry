import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting state (in-memory; in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  'talent:browse': { limit: 200, windowMs: 60 * 60 * 1000 }, // 200/hr
  'profile:detail': { limit: 100, windowMs: 60 * 60 * 1000 }, // 100/hr
  'analytics:export': { limit: 10, windowMs: 60 * 60 * 1000 }, // 10/hr
  'match:compute': { limit: 1000, windowMs: 60 * 60 * 1000 }, // 1000/hr
  default: { limit: 500, windowMs: 60 * 60 * 1000 }, // 500/hr default
};

function getRateLimitKey(req: NextRequest, path: string): string {
  // Use IP + path pattern as key
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (path.includes('/api/profiles') && req.method === 'GET') return `${ip}:talent:browse`;
  if (path.match(/\/api\/profiles\/[^/]+$/) && req.method === 'GET') return `${ip}:profile:detail`;
  if (path.includes('/api/analytics') && path.includes('export')) return `${ip}:analytics:export`;
  if (path.includes('/api/match') && req.method === 'POST') return `${ip}:match:compute`;
  return `${ip}:default`;
}

function checkRateLimit(key: string): boolean {
  const category = key.split(':').slice(1).join(':') || 'default';
  const config = RATE_LIMITS[category] || RATE_LIMITS.default;
  const now = Date.now();

  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  if (entry.count >= config.limit) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of Array.from(rateLimitStore.entries())) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;

    // Rate limiting for API routes
    if (path.startsWith('/api/') && !path.startsWith('/api/auth/')) {
      const rateLimitKey = getRateLimitKey(req, path);
      if (!checkRateLimit(rateLimitKey)) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' },
          { status: 429 }
        );
      }
    }

    // Block bulk export endpoints
    if (path.includes('/api/profiles') && req.nextUrl.searchParams.get('export') === 'bulk') {
      return NextResponse.json(
        { error: 'Bulk export is not allowed', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Add correlation ID header
    const response = NextResponse.next();
    const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
    response.headers.set('x-correlation-id', correlationId);
    response.headers.set('x-powered-by', 'ZenCube Talent Registry');

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public routes
        if (path === '/' || path === '/login' || path.startsWith('/api/auth/')) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/employer/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/jobs/:path*',
    '/applications/:path*',
    '/placements/:path*',
    '/notifications/:path*',
    '/api/profiles/:path*',
    '/api/employers/:path*',
    '/api/jobs/:path*',
    '/api/applications/:path*',
    '/api/match/:path*',
    '/api/consent/:path*',
    '/api/placements/:path*',
    '/api/analytics/:path*',
    '/api/admin/:path*',
    '/api/notifications/:path*',
  ],
};
