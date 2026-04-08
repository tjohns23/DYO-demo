import { redirect } from 'next/navigation';
import { getUserArchetypeProfile, getUserArchetypeInfo } from '@/lib/actions/profile';
import { getActiveMissionAction } from '@/lib/actions/mission';
import MissionContainer from '@/components/mission/MissionContainer';

export default async function MissionPage() {
  const [profile, archetypeInfo, activeMissionResult] = await Promise.all([
    getUserArchetypeProfile(),
    getUserArchetypeInfo(),
    getActiveMissionAction(),
  ]);

  if (!profile) {
    redirect('/');
  }

  return (
    <MissionContainer
      archetypeName={archetypeInfo?.name}
      archetypeSlug={archetypeInfo?.slug}
      initialMission={activeMissionResult.mission ?? null}
    />
  );
}
