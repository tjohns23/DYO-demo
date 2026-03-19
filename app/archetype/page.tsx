import { redirect } from 'next/navigation';
import { getUserArchetypeProfile } from '@/lib/actions/profile';
import ArchetypeProfile from '@/components/assessment/ArchetypeProfile';

export default async function ArchetypePage() {
  const profile = await getUserArchetypeProfile();

  if (!profile) {
    // If no profile found, redirect back to quiz
    redirect('/');
  }

  return <ArchetypeProfile profile={profile} />;
}
