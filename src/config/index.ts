export const config = {
  app: {
    name: 'ZenCube Talent Registry',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  auth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    secret: process.env.NEXTAUTH_SECRET || '',
  },
  nats: {
    url: process.env.NATS_URL || 'nats://localhost:4222',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  zenya: {
    apiUrl: process.env.ZENYA_API_URL || 'http://localhost:5055',
    apiKey: process.env.ZENYA_API_KEY || '',
  },
  flutto: {
    apiUrl: process.env.FLUTTO_API_URL || 'http://localhost:3001',
    apiToken: process.env.FLUTTO_API_TOKEN || '',
  },
  email: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@talentregistry.zencube.ai',
  },
  retention: {
    days: parseInt(process.env.RETENTION_DAYS || '30', 10),
    graceDays: parseInt(process.env.RETENTION_GRACE_DAYS || '7', 10),
    anonymizationSalt: process.env.RETENTION_ANONYMIZATION_SALT || 'talent-registry-salt-2026',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;
