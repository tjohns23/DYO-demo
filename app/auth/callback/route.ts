import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { saveAssessmentToProfile } from '@/lib/actions/profile';
import type { ArchetypeProfile } from '@/lib/actions/assessment';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent('No authentication code provided')}`);
  }

  const cookieStore = await cookies();

  // Collect auth cookies from Supabase to apply on the final response.
  // We defer creating the response until we know the redirect path, so we
  // buffer cookies here instead of writing them to an intermediate response.
  const supabaseCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          supabaseCookies.push(...cookiesToSet);
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(error?.message ?? 'Authentication failed')}`
    );
  }

  // Read the pending assessment cookie set by the quiz
  const pendingRaw = cookieStore.get('pending_assessment')?.value;

  if (!pendingRaw) {
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

    // Check if user is beta approved
    const { data: profileData } = await supabase
      .from('profiles')
      .select('beta_approved')
      .eq('id', data.user.id)
      .single();

    const isBetaApproved = profileData?.beta_approved === true;
    const redirectPath = isBetaApproved ? '/dashboard' : '/waitlist';

    // Create the single final response — all cookies are applied to this one object
    const response = NextResponse.redirect(`${origin}${redirectPath}`);

    // Apply all buffered Supabase auth session cookies
    supabaseCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
    });

    // Clear the pending assessment cookie
    response.cookies.delete('pending_assessment');

    return response;
  } catch (err) {
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent('An error occurred while processing your assessment.')}`
    );
  }
}
