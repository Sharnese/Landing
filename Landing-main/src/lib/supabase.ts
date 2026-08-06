import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for MyHCBS admin.
 *
 * This app connects to the real Supabase project below. Connection details are
 * read from environment variables FIRST so they can be overridden without a
 * code change:
 *
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *
 * If the env vars are not present at build time, the app falls back to the
 * project's published values baked in below. The anon (publishable) key is
 * designed to be exposed in client-side code, so shipping it here is safe — it
 * only grants the access allowed by your Row Level Security policies.
 *
 * The app talks to exactly one project: the one configured here. No external
 * fallback connections and no "deleted project" blocking.
 */

const env = (import.meta as any).env || {};

// Real Supabase project (used unless overridden by env vars).
const PROJECT_URL = 'https://mikzspishjrvxsasjpnk.supabase.co';
const PROJECT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pa3pzcGlzaGpydnhzYXNqcG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDEyNjMsImV4cCI6MjA5NjkxNzI2M30.CvPaWNZGXPcAl-CAd1zkOuHmAvUtEr7sJVhZ7pFCRwM';

const supabaseUrl = String(env.VITE_SUPABASE_URL || '').trim() || PROJECT_URL;
const supabaseAnonKey = String(env.VITE_SUPABASE_ANON_KEY || '').trim() || PROJECT_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Supabase URL missing.');
}
if (!supabaseAnonKey) {
  throw new Error('Supabase anon key missing.');
}

// Developer check on startup. Logs the URL only — never the anon key.
// eslint-disable-next-line no-console
console.log('Supabase URL loaded:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
