import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Admin/Service Client: Use this ONLY in Server Actions or API routes.
 * It bypasses RLS and is required for backend-only tasks like:
 * - Scoring assessments
 * - Running keyword-based pattern detection
 * - Forcing mission immutability
 */
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
