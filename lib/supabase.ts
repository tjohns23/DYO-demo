import { createClient } from '@supabase/supabase-js';

// Environment variables are automatically loaded by Next.js from .env files
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');

/**
 * Standard Client: Use this in Client Components or standard Server Actions.
 * It respects Row Level Security (RLS) based on the user's session.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);