'use client';

import React, { useState } from 'react';
import type { ArchetypeSlug } from '@/lib/actions/assessment';
import { acceptMissionAction } from '@/lib/actions/mission';
import type { Mission } from '@/lib/mission/missionEngine';

import MissionStep1 from './MissionStep1';
import MissionStep2 from './MissionStep2';
import MissionStep3 from './MissionStep3';

export type MissionFlow = 'input' | 'brief' | 'active';

export interface GeneratedMission {
  missionId: string;
  description: string;
  pattern: string;
  patternDetected: boolean;
  framing: string;
  timebox: number;
  scope: string;
  completion: string;
  constraint: string;
  acceptedAt?: string;
  thoughtParking?: string;
}

interface MissionContainerProps {
  archetypeName?: string;
  archetypeSlug?: ArchetypeSlug;
  initialMission?: GeneratedMission | null;
  isExec?: boolean;
}

export default function MissionContainer({ archetypeName = 'Your Archetype', initialMission, isExec }: MissionContainerProps) {
  const [step, setStep] = useState<MissionFlow>(initialMission ? 'active' : 'input');
  const [mission, setMission] = useState<GeneratedMission | null>(initialMission ?? null);
  const [fullMission, setFullMission] = useState<Mission | null>(null);
  const [workDescription, setWorkDescription] = useState<string>('');

  const handleGoToStep = (nextStep: MissionFlow) => {
    setStep(nextStep);
    window.scrollTo(0, 0);
  };

  const handleMissionGenerated = (newMission: GeneratedMission, full: Mission, description: string) => {
    setMission(newMission);
    setFullMission(full);
    setWorkDescription(description);
    handleGoToStep('brief');
  };

  const handleAcceptMission = async () => {
    if (!mission || !fullMission) return;
    const acceptedAt = new Date().toISOString();
    await acceptMissionAction(mission.missionId, fullMission, acceptedAt, workDescription);
    // Clear sessionStorage when mission is accepted
    sessionStorage.removeItem('mission_description');
    setMission({ ...mission, acceptedAt });
    handleGoToStep('active');
  };

  return (
    <div className="min-h-screen bg-background">
      {step === 'input' && <MissionStep1 onMissionGenerated={handleMissionGenerated} archetypeName={archetypeName} isExec={isExec} />}
      {step === 'brief' && mission && (
        <MissionStep2 mission={mission} onAccept={handleAcceptMission} onRegenerate={() => handleGoToStep('input')} archetypeName={archetypeName} isExec={isExec} />
      )}
      {step === 'active' && mission && <MissionStep3 mission={mission} archetypeName={archetypeName} isExec={isExec} />}
    </div>
  );
}
