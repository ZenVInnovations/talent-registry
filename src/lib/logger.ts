import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['*.email', '*.phone', '*.authorization', '*.cookie', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
  ...(process.env.NODE_ENV === 'development'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {}),
});

export function createChildLogger(context: Record<string, unknown>) {
  return logger.child({ service: 'talent-registry', ...context });
}
