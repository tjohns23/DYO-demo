import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import AssessmentQuiz from '@/components/assessment/AssessmentQuiz';
import SearchParamsHandler from './search-params-handler';
import { createClient } from '@/lib/supabase-server';
import { getUserArchetypeProfile } from '@/lib/actions/profile';

export default async function Home() {
  // Create server-side Supabase client (reads auth from cookies)
  const supabase = await createClient();
  
  // Check if user is authenticated (getUser validates JWT server-side)
  const { data: { user } } = await supabase.auth.getUser();

  console.log('[page.tsx] User check:', {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
  });

  if (user) {
    console.log('[page.tsx] User authenticated, checking profile...');
    // User is authenticated - check if they have a completed assessment
    const profile = await getUserArchetypeProfile();
    
    console.log('[page.tsx] Profile check:', {
      hasProfile: !!profile,
      slug: profile?.slug,
    });
    
    if (profile) {
      // Both authenticated AND has assessment → go to dashboard
      console.log('[page.tsx] Redirecting to /dashboard');
      redirect('/dashboard');
    }
    // If no profile but authenticated, fall through to show quiz (edge case recovery)
  }

  // Unauthenticated or authenticated without profile - show quiz
  console.log('[page.tsx] Showing quiz');
  return (
    <Suspense fallback={null}>
      <SearchParamsHandler>
        <AssessmentQuiz />
      </SearchParamsHandler>
    </Suspense>
  );
}
