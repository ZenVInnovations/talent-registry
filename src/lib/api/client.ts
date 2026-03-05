export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      body.code || 'UNKNOWN_ERROR',
      body.error || response.statusText,
      body.details,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

type RequestOptions = Omit<RequestInit, 'method' | 'body'> & {
  params?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export const api = {
  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;
    const response = await fetch(buildUrl(path, params), {
      ...init,
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...init.headers },
    });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;
    const response = await fetch(buildUrl(path, params), {
      ...init,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...init.headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;
    const response = await fetch(buildUrl(path, params), {
      ...init,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...init.headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async put<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;
    const response = await fetch(buildUrl(path, params), {
      ...init,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...init.headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;
    const response = await fetch(buildUrl(path, params), {
      ...init,
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...init.headers },
    });
    return handleResponse<T>(response);
  },
};
