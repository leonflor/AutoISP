import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// IMPORTANTE: Substitua estes valores pelas suas credenciais reais do Supabase
// Encontre em: Supabase Dashboard → Settings → API
const SUPABASE_URL = "https://zvxcwwhsjtdliihlvvof.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2eGN3d2hzanRkbGlpaGx2dm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1OTU5NDIsImV4cCI6MjA4NDE3MTk0Mn0.cAG6WRnoE0QkJwGdkiA9dZ2pBHWXenxsH87ThKvH61k";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
