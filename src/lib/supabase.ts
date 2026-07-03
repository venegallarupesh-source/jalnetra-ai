import { createClient } from '@supabase/supabase-js';

export const isSupabaseConfigured = true;

export const supabase = createClient(
  'https://tlutmrgvjlrxfaixztik.supabase.co',
  'sb_publishable_iI6bP4hrWGV9cR5LjprNWA_q3dIsjIZ',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
