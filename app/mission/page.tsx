import { redirect } from 'next/navigation';
import { getUserArchetypeProfile, getUserArchetypeInfo } from '@/lib/actions/profile';
import { getActiveMissionAction } from '@/lib/actions/mission';
import MissionContainer from '@/components/mission/MissionContainer';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function MissionPage() {
  const [profile, archetypeInfo, activeMissionResult] = await Promise.all([
    getUserArchetypeProfile(),
    getUserArchetypeInfo(),
    getActiveMissionAction(),
  ]);

  if (!profile) {
    redirect('/');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profileData } = user
    ? await supabaseAdmin.from('profiles').select('is_exec').eq('id', user.id).single()
    : { data: null };
  const isExec = profileData?.is_exec ?? false;

  return (
    <MissionContainer
      archetypeName={archetypeInfo?.name}
      archetypeSlug={archetypeInfo?.slug}
      initialMission={activeMissionResult.mission ?? null}
      isExec={isExec}
    />
  );
}
