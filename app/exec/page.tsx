import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserArchetypeInfo } from '@/lib/actions/profile';
import NavHeader from '@/components/NavHeader';
import ExecClientPage from '@/components/exec/ExecClientPage';
import WaitlistTab from '@/components/exec/WaitlistTab';
import PreApprovalTab from '@/components/exec/PreApprovalTab';

export default async function ExecPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  const [{ data: profile }, archetypeInfo] = await Promise.all([
    supabaseAdmin.from('profiles').select('is_exec').eq('id', user.id).single(),
    getUserArchetypeInfo(),
  ]);

  if (!profile?.is_exec) redirect('/dashboard');

  return (
    <div
      className="min-h-screen bg-background"
      style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(120,20,50,0.25) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 80% 100%, rgba(80,10,30,0.2) 0%, transparent 60%)' }}
    >
      <NavHeader activePage="exec" archetypeName={archetypeInfo?.name ?? 'Unknown'} isExec={true} isBetaApproved={true} />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <ExecClientPage waitlistTab={<WaitlistTab />} preApprovalTab={<PreApprovalTab />} />
      </div>
    </div>
  );
}
