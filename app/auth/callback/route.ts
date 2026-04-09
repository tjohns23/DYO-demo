import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { saveAssessmentToProfile } from '@/lib/actions/profile';
import type { ArchetypeProfile } from '@/lib/actions/assessment';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    console.error('[auth/callback] No code param in URL');
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent('No authentication code provided')}`);
  }

  const cookieStore = await cookies();

  // Success redirect — auth cookies will be set on this response (let, not const — reassigned after beta check)
  let response = NextResponse.redirect(`${origin}/dashboard`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  console.log('[auth/callback] exchangeCodeForSession:', {
    hasUser: !!data?.user,
    userId: data?.user?.id,
    error: error?.message,
  });

  if (error || !data?.user) {
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(error?.message ?? 'Authentication failed')}`
    );
  }

  // Read the pending assessment cookie set by the quiz
  const pendingRaw = cookieStore.get('pending_assessment')?.value;

  if (!pendingRaw) {
    console.error('[auth/callback] No pending_assessment cookie found');
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent('Assessment data not found. Please try again.')}`
    );
  }

  try {
    const profile = JSON.parse(decodeURIComponent(pendingRaw)) as ArchetypeProfile;
    const result = await saveAssessmentToProfile(data.user.id, data.user.email!, profile);

    if (!result.success) {
      return NextResponse.redirect(
        `${origin}/?error=${encodeURIComponent(result.error ?? 'Failed to save assessment')}`
      );
    }

    // Clear the pending assessment cookie and set user_id for server actions
    response.cookies.delete('pending_assessment');
    response.cookies.set('user_id', data.user.id, { httpOnly: true, path: '/', sameSite: 'lax' });

    // Check if user is beta approved
    const { data: profileData } = await supabase
      .from('profiles')
      .select('beta_approved')
      .eq('id', data.user.id)
      .single();

    const isBetaApproved = profileData?.beta_approved === true;
    const redirectPath = isBetaApproved ? '/dashboard' : '/waitlist';
    response = NextResponse.redirect(`${origin}${redirectPath}`);

    return response;
  } catch (err) {
    console.error('[auth/callback] Error processing assessment:', err);
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent('An error occurred while processing your assessment.')}`
    );
  }
}
