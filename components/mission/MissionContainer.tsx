'use client';

import React, { useState } from 'react';
import type { ArchetypeSlug } from '@/lib/actions/assessment';
import { acceptMissionAction } from '@/lib/actions/mission';

import MissionStep1 from './MissionStep1';
import MissionStep2 from './MissionStep2';
import MissionStep3 from './MissionStep3';

export type MissionFlow = 'input' | 'brief' | 'active';

export interface GeneratedMission {
  missionId: string;
  description: string;
  pattern: string;
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
}

export default function MissionContainer({ archetypeName = 'Your Archetype', archetypeSlug, initialMission }: MissionContainerProps) {
  const [step, setStep] = useState<MissionFlow>(initialMission ? 'active' : 'input');
  const [mission, setMission] = useState<GeneratedMission | null>(initialMission ?? null);

  const handleGoToStep = (nextStep: MissionFlow) => {
    setStep(nextStep);
    window.scrollTo(0, 0);
  };

  const handleMissionGenerated = (newMission: GeneratedMission) => {
    setMission(newMission);
    handleGoToStep('brief');
  };

  const handleAcceptMission = async () => {
    if (!mission) return;
    const acceptedAt = new Date().toISOString();
    await acceptMissionAction(mission.missionId, acceptedAt);
    setMission({ ...mission, acceptedAt });
    handleGoToStep('active');
  };

  return (
    <div className="min-h-screen bg-background">
      {step === 'input' && <MissionStep1 onMissionGenerated={handleMissionGenerated} archetypeName={archetypeName} />}
      {step === 'brief' && mission && (
        <MissionStep2 mission={mission} onAccept={handleAcceptMission} onRegenerate={() => handleGoToStep('input')} archetypeName={archetypeName} />
      )}
      {step === 'active' && mission && <MissionStep3 mission={mission} archetypeName={archetypeName} />}
    </div>
  );
}
