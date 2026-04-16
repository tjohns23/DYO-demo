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
      <NavHeader activePage="home" archetypeName={archetypeInfo?.name ?? 'Unknown'} isExec={isExec} />
      <div className="max-w-280 mx-auto grid grid-cols-[1fr_400px] gap-8 px-6 py-4 pb-10 items-start">
        <HomePageClient />
        <HomeRightPanel />
      </div>
    </div>
  );
}
