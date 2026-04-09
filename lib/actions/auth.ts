'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Sends a magic link to the provided email address.
 * Uses Supabase Auth's built-in magic link functionality.
 *
 * @param email The user's email address
 * @param emailRedirectTo The URL to redirect to after email link is clicked
 * @returns { success: boolean, error?: string }
 */
export async function sendMagicLink(email: string, emailRedirectTo: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate email
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Use Supabase admin client to send magic link
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      console.error('Magic link error:', error);
      return { success: false, error: error.message || 'Failed to send magic link.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error sending magic link:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
