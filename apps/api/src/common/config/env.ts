import { z } from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string(),
  DATABASE_URL: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  TWITTER_CLIENT_ID: z.string(),
  TWITTER_CLIENT_SECRET: z.string(),
  MICROSOFT_CLIENT_ID: z.string(),
  MICROSOFT_CLIENT_SECRET: z.string(),
  MICROSOFT_TENANT_ID: z.string(), // tenant GUID, or common/organizations/consumers
  PUBLIC_BASE_APP_URL: z.string().url(), // the url of this app (api)
  PUBLIC_BASE_APP_ORIGIN: z.string().url(),
  CSRF_SECRET: z.string().min(4),
  RESEND_API_KEY: z.string().startsWith('re_'),
});

export type Env = z.infer<typeof envSchema>;

export const envValidation = envSchema.parse;
