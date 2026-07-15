import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'basetrade',
    ssl: process.env.DB_SSL === 'true',
  },
  cache: {
    ttl: Number(process.env.CACHE_TTL_SECONDS ?? 60) * 1000,
  },
  redis: {
    url: process.env.REDIS_URL ?? '',
  },
  external: {
    timeoutMs: Number(process.env.EXTERNAL_API_TIMEOUT_MS ?? 10_000),
    coingeckoUrl: process.env.COINGECKO_API_URL ?? 'https://api.coingecko.com/api/v3',
  },
}));
