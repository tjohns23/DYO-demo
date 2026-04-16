import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import AssessmentQuiz from '@/components/assessment/AssessmentQuiz';
import SearchParamsHandler from './search-params-handler';
import { createClient } from '@/lib/supabase-server';
import { getUserArchetypeProfile } from '@/lib/actions/profile';

// Force dynamic rendering to ensure fresh auth on every request
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Create server-side Supabase client (reads auth from cookies)
  const supabase = await createClient();
  
  // Check if user is authenticated (getUser validates JWT server-side)
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // User is authenticated - check if they have a completed assessment
    const profile = await getUserArchetypeProfile();
    
    if (profile) {
      // Both authenticated AND has assessment → go to home
      redirect('/home');
    }
    // If no profile but authenticated, fall through to show quiz (edge case recovery)
  }

  // Unauthenticated or authenticated without profile - show quiz
  return (
    <Suspense fallback={null}>
      <SearchParamsHandler>
        <AssessmentQuiz />
      </SearchParamsHandler>
    </Suspense>
  );
}
