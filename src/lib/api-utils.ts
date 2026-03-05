import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { errorToResponse } from './errors';
import { ApiUser } from '@/types';
import { ZodSchema } from 'zod';

export interface ApiContext {
  session: Awaited<ReturnType<typeof getServerSession>>;
  user?: ApiUser;
  params: Record<string, string>;
}

export interface ApiHandlerOptions {
  requireAuth?: boolean;
}

export function withApiHandler<T = unknown>(
  handler: (req: NextRequest, context: ApiContext) => Promise<T>,
  options: ApiHandlerOptions = {}
) {
  return async (req: NextRequest, routeContext?: { params: Promise<Record<string, string>> }) => {
    try {
      const session = await getServerSession(authOptions);

      if (options.requireAuth !== false && !session?.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const params = routeContext?.params ? await routeContext.params : {};

      const result = await handler(req, {
        session,
        user: session?.user as ApiUser | undefined,
        params,
      });

      return NextResponse.json(result);
    } catch (error) {
      const { body, status } = errorToResponse(error);
      return NextResponse.json(body, { status });
    }
  };
}

export async function parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  const raw = await req.json();
  const result = schema.safeParse(raw);
  if (!result.success) {
    const { ValidationError } = await import('./errors');
    const details: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    }
    throw new ValidationError('Validation failed', details);
  }
  return result.data;
}

export function parseQuery<T>(req: NextRequest, schema: ZodSchema<T>): T {
  const { searchParams } = new URL(req.url);
  const raw: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });
  const result = schema.safeParse(raw);
  if (!result.success) {
    const details: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    }
    // Throw synchronously since we import at top level
    throw Object.assign(new Error('Validation failed'), {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details,
      name: 'ValidationError',
    });
  }
  return result.data;
}

export function getPaginationParams(req: NextRequest): { page: number; limit: number; skip: number } {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  return { page, limit, skip: (page - 1) * limit };
}
