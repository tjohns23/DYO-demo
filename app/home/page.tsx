import { redirect } from 'next/navigation';
import HomePageClient from '@/components/home/HomePageClient';
import HomeRightPanel from '@/components/home/HomeRightPanel';
import NavHeader from '@/components/NavHeader';
import { getUserArchetypeInfo } from '@/lib/actions/profile';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Gate on beta approval
  const { data: profileData } = await supabaseAdmin
    .from('profiles')
    .select('beta_approved, is_exec')
    .eq('id', user.id)
    .single();

  if (!profileData?.beta_approved) {
    redirect('/waitlist');
  }

  const isExec = profileData?.is_exec ?? false;
  const archetypeInfo = await getUserArchetypeInfo();

  return (
    <div className="min-h-screen bg-background" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 30% 0%, rgba(120,20,50,0.2) 0%, transparent 70%)' }}>
      <NavHeader activePage="home" archetypeName={archetypeInfo?.name ?? 'Unknown'} isExec={isExec} isBetaApproved={true} />
      <div className="max-w-[1400px] mx-auto grid grid-cols-[300px_1fr_400px] gap-6 px-6 py-4 pb-10 items-start">
        {/* LEFT — Friends (coming soon) */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-5 flex flex-col gap-3 mt-10">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--glass-text-muted)] pb-2.5 border-b border-[rgba(255,255,255,0.05)]">
            Friends Active
          </div>
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--glass-surface)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--glass-text-dimmer)] text-lg">
              ◌
            </div>
            <div className="text-xs text-[var(--glass-text-dimmer)] text-center font-mono uppercase tracking-[0.1em]">
              Coming soon
            </div>
          </div>
        </div>
        <HomePageClient />
        <HomeRightPanel />
      </div>
    </div>
  );
}
