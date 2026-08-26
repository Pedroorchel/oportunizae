import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Fallback to the working instance if the environment variable is pointing to the dead host
const isDeadHost = envUrl.includes('ckzygdwhihybrdzctdup');

const supabaseUrl = (
  (!isDeadHost && envUrl) ? envUrl : 'https://sqqiqmzrhmgrtkborskf.supabase.co'
).trim().replace(/\/+$/, '').replace(/\/rest\/v1\/?$/, '').trim();

const supabaseAnonKey = (
  (!isDeadHost && envKey) ? envKey : 'sb_publishable_yxogI5YkdGvX_ntUEgXPuA_5-M3d0Fq'
).trim();

// Direct Supabase Client connected to real database
export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage // Store auth tokens securely for session persistence
    }
  }
);

// Backward-compatibility helper
export function isSupabaseUsingDummy() {
  return false;
}
