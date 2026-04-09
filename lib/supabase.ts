import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Client: Use this in Client Components.
 * Uses @supabase/ssr so the session is stored in cookies (not localStorage),
 * making it readable by server components and middleware.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);