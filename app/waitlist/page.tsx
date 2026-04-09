import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function WaitlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to home if not authenticated
  if (!user) {
    redirect('/');
  }

  // Check if user is beta approved (should have been caught in callback, but safety check)
  const { data: profileData } = await supabaseAdmin
    .from('profiles')
    .select('beta_approved, email')
    .eq('id', user.id)
    .single();

  // If approved, redirect to dashboard
  if (profileData?.beta_approved === true) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(120,20,50,0.25) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 80% 100%, rgba(80,10,30,0.2) 0%, transparent 60%)' }}>
      <div className="w-full max-w-md">
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_40px_rgba(0,0,0,0.3)]">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
              You're on the waitlist
            </h1>
            <p className="text-[var(--glass-text-muted)] text-sm">
              Thanks for your interest in DYO! We're reviewing your application.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 mb-8">
            <div className="flex gap-4">
              <div className="text-2xl">⏱️</div>
              <div>
                <h3 className="font-semibold text-[var(--color-text)] mb-1">
                  Coming Soon
                </h3>
                <p className="text-sm text-[var(--glass-text-muted)]">
                  We're carefully selecting beta testers to ensure the best experience for everyone.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl">✉️</div>
              <div>
                <h3 className="font-semibold text-[var(--color-text)] mb-1">
                  Stay Tuned
                </h3>
                <p className="text-sm text-[var(--glass-text-muted)]">
                  We'll send you an email at{' '}
                  <span className="text-[var(--color-text)]">{profileData?.email}</span>{' '}
                  when you're approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
