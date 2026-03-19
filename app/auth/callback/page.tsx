'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { saveAssessmentToProfile } from '@/lib/actions/profile';
import { ArchetypeProfile } from '@/lib/actions/assessment';

/**
 * Handles the magic link callback from Supabase Auth.
 *
 * Supports both flows:
 *  1. Authorization Code Flow (PKCE): ?code= query param, then exchange for session
 *  2. Implicit Flow: #access_token= hash param, directly set session
 *
 * After auth succeeds:
 *  - Save pending assessment to the user's profile
 *  - Redirect to the archetype profile page
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // First, let Supabase handle extracting tokens from URL (hash or query)
        // This will automatically parse both ?code= and #access_token= flows
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session?.user) {
          console.error('Failed to get session:', error);
          
          // Fallback: Try to manually exchange code if present
          const code = new URLSearchParams(window.location.search).get('code');
          if (code) {
            console.log('Attempting code exchange...');
            const { data: codeData, error: codeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (codeError || !codeData.user) {
              console.error('Code exchange failed:', codeError);
              router.push(`/?error=${encodeURIComponent(codeError?.message ?? 'Authentication failed')}`);
              return;
            }

            // Code exchange succeeded, continue with user
            return handleUser(codeData.user);
          }
          
          router.push(`/?error=${encodeURIComponent(error?.message ?? 'Authentication failed')}`);
          return;
        }

        handleUser(data.session.user);
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        router.push(`/?error=${encodeURIComponent('An unexpected error occurred.')}`);
      }
    };

    const handleUser = async (user: User) => {
      console.log('Auth successful. User ID:', user.id);

      // Read and save the pending assessment from cookie
      const pendingCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('pending_assessment='));

      if (!pendingCookie) {
        console.error('No pending_assessment cookie found');
        router.push(`/?error=${encodeURIComponent('Assessment data not found. Please try again.')}`);
        return;
      }

      try {
        const raw = decodeURIComponent(pendingCookie.split('=').slice(1).join('='));
        const profile = JSON.parse(raw) as ArchetypeProfile;
        console.log('Saving assessment to profile...', profile.slug);
        
        const result = await saveAssessmentToProfile(user.id, user.email!, profile);
        
        if (!result.success) {
          console.error('Failed to save assessment:', result.error);
          router.push(`/?error=${encodeURIComponent(result.error ?? 'Failed to save assessment')}`);
          return;
        }
        
        console.log('Assessment saved successfully');
        // Clear the cookie
        document.cookie = 'pending_assessment=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        router.push('/archetype');
      } catch (err) {
        console.error('Error processing assessment:', err);
        router.push(`/?error=${encodeURIComponent('An error occurred while processing your assessment. Please try again.')}`);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center font-inter">
      <p className="text-(--color-neutral)">Verifying your magic link...</p>
    </div>
  );
}
