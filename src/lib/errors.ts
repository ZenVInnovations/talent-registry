export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHENTICATED');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    super(id ? `${entity} with id '${id}' not found` : `${entity} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

export function errorToResponse(error: unknown): { body: Record<string, unknown>; status: number } {
  if (error instanceof AppError) {
    return {
      body: {
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && error.details ? { details: error.details } : {}),
      },
      status: error.statusCode,
    };
  }

  console.error('Unhandled error:', error);
  return {
    body: { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    status: 500,
  };
}
