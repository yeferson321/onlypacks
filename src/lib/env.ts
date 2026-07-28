import { env } from 'cloudflare:workers';

export const ENV = {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_KEY: env.SUPABASE_KEY,
} as const;