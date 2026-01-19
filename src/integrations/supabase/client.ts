import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Supabase public credentials (anon key is safe for frontend - security comes from RLS)
// For external deployments, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

// Check if we're using placeholder values (Lovable Cloud not connected)
const isPlaceholder = SUPABASE_URL.includes("placeholder");

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Export flag for components to check if Supabase is properly configured
export const isSupabaseConfigured = !isPlaceholder;
