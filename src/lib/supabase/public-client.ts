import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabasePublicEnv } from './env';
import type { Database } from './types';

export function createSupabasePublicClient(): SupabaseClient<Database> {
  const { url, anonKey } = getSupabasePublicEnv();

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}
