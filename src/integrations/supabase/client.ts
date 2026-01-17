import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// IMPORTANTE: Substitua estes valores pelas suas credenciais reais do Supabase
// Encontre em: Supabase Dashboard → Settings → API
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
