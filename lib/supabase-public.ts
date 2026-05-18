// Public Supabase client. Singleton wrapping the anon role — safe to use
// from both server and client code. Distinct from app/lib/supabase.ts only
// in that this module is explicitly scoped to public, read-only operations
// (RPCs with anon EXECUTE grant + recipes_published anon SELECT) so it can
// be imported from client components without dragging server-only helpers
// into the bundle.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabasePublic: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: false } })
    : null;

export const supabasePublicConfigured = Boolean(url && anonKey);
