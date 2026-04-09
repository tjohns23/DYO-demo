'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { GeneratedMission } from './MissionContainer';
import { completeMissionAction, expireMissionAction, saveThoughtParkingAction } from '@/lib/actions/mission';
import NavHeader from '@/components/NavHeader';
import ArtifactUploadModal from './ArtifactUploadModal';

interface MissionStep3Props {
  mission: GeneratedMission;
  archetypeName?: string;
}

export default function MissionStep3({ mission, archetypeName }: MissionStep3Props) {
  const router = useRouter();
  const total = mission.timebox * 60;
  const [totalSeconds, setTotalSeconds] = useState(() => {
    if (mission.acceptedAt) {
      const elapsed = Math.floor((Date.now() - new Date(mission.acceptedAt).getTime()) / 1000);
      return Math.max(0, total - elapsed);
    }
    return total;
  });
  const finalizedRef = useRef(false);
  const [thoughts, setThoughts] = useState(mission.thoughtParking ?? '');
  const thoughtsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showArtifactModal, setShowArtifactModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const handleThoughtsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setThoughts(value);
    if (thoughtsDebounceRef.current) clearTimeout(thoughtsDebounceRef.current);
    thoughtsDebounceRef.current = setTimeout(() => {
      saveThoughtParkingAction(mission.missionId, value);
    }, 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          if (!finalizedRef.current) {
            finalizedRef.current = true;
            expireMissionAction(mission.missionId);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mission.missionId]);

  const isFinished = totalSeconds <= 0;

  const handleMarkDone = async () => {
    if (finalizedRef.current) return;
    const elapsed = total - totalSeconds;
    setElapsedSeconds(elapsed);
    setShowArtifactModal(true);
  };

  const handleArtifactUploadSuccess = async () => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    setTotalSeconds(0);
    setShowArtifactModal(false);
    const result = await completeMissionAction(mission.missionId, elapsedSeconds);
    
    if (!result.success) {
      console.error('[MissionStep3] Failed to complete mission:', result.error);
      finalizedRef.current = false;
      alert(`Failed to mark mission as complete: ${result.error}`);
    } else {
      router.push('/dashboard');
    }
  };

  const progress = Math.max(0, totalSeconds / total);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const circumference = 628; // 2π * 100
  const offset = circumference * (1 - progress);

  return (
    <>
      <NavHeader
        activePage="mission"
        rightSlot={
          isFinished ? (
            <div className="font-mono text-xs px-3.5 py-1.5 rounded-full border border-[var(--glass-border)] text-[var(--glass-text-muted)]">
              Mission ended
            </div>
          ) : (
            <div className="font-mono text-xs px-3.5 py-1.5 rounded-full border border-[var(--glass-success-border)] text-[var(--glass-success)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--glass-success)] shadow-[0_0_7px_var(--glass-success)] animate-pulse" />
              Mission active
            </div>
          )
        }
      />

      <div className="max-w-6xl mx-auto px-6 py-9 grid grid-cols-[1fr_380px] gap-0">
        {/* LEFT */}
        <div className="pr-10">
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-55 h-55 flex items-center justify-center mb-6">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 220 220">
                <circle
                  cx="110"
                  cy="110"
                  r="100"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="8"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="100"
                  fill="none"
                  stroke="#e03060"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center',
                    filter: 'drop-shadow(0 0 6px rgba(224,48,96,0.6))',
                    transition: 'stroke-dashoffset 1s linear',
                  }}
                />
              </svg>
              <div className="flex flex-col items-center">
                <div
                  className="font-mono text-5xl font-medium text-[var(--glass-text-primary)] tracking-[-0.02em] leading-none text-shadow-[0_0_30px_rgba(224,48,96,0.3)]"
                  style={{
                    textShadow: '0 0 30px rgba(224,48,96,0.3)',
                  }}
                >
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--glass-text-muted)] mt-1.5">
                  Remaining
                </div>
              </div>
            </div>
          </div>

          {!isFinished && (
            <button
              onClick={handleMarkDone}
              className="w-full mb-4 px-3.5 py-3 rounded-2xl bg-transparent border border-[var(--glass-success-border)] text-[var(--glass-success)] font-mono text-xs font-semibold uppercase tracking-[0.12em] cursor-pointer transition-all hover:bg-[rgba(61,224,138,0.06)] hover:border-[rgba(61,224,138,0.5)]"
            >
              I shipped it — mark as done
            </button>
          )}

          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl backdrop-blur-3xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.3),inset_0_0_40px_rgba(160,30,60,0.08)] relative">
            <div className="absolute top-4 right-4 font-mono text-xs px-2.5 py-1 rounded-full border border-[var(--glass-border)] text-[var(--glass-text-muted)]">
              🔒 Locked
            </div>

            <div className="mb-3.5">
              <div className="font-mono text-xs font-semibold text-[var(--glass-text-muted)] uppercase tracking-[0.15em] mb-1.25">
                Scope
              </div>
              <div className="text-base text-[var(--glass-text-primary)] font-medium leading-relaxed">
                {mission.scope}
              </div>
            </div>

            <hr className="border-none border-t border-[var(--glass-grid)] my-5" />

            <div className="mb-3.5">
              <div className="font-mono text-xs font-semibold text-[var(--glass-text-muted)] uppercase tracking-[0.15em] mb-1.25">
                Done When
              </div>
              <div className="text-base text-[var(--glass-text-primary)] font-medium leading-relaxed">
                {mission.completion}
              </div>
            </div>

            <hr className="border-none border-t border-[var(--glass-grid)] my-5" />

            <div className="mb-0">
              <div className="font-mono text-xs font-semibold text-[var(--glass-text-muted)] uppercase tracking-[0.15em] mb-1.25">
                Constraint
              </div>
              <div className="text-base text-[var(--glass-accent)] font-medium leading-relaxed">
                {mission.constraint}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="flex flex-col gap-3 border-l border-[rgba(180,40,70,0.2)] pl-10">
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl backdrop-blur-3xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.3),inset_0_0_40px_rgba(160,30,60,0.08)]">
            <div className="font-mono text-xs font-semibold text-[var(--glass-text-muted)] uppercase tracking-[0.15em] mb-2.5">
              Thought Parking
            </div>
            <textarea
              value={thoughts}
              onChange={handleThoughtsChange}
              placeholder="Jot down distractions here — ideas, worries, edits you want to make — so your brain can let them go and stay focused."
              className="w-full min-h-55 bg-[rgba(255,255,255,0.02)] border border-[var(--glass-border-light)] rounded-xl outline-none resize-none font-sans text-xs text-[var(--glass-text-primary)] leading-relaxed placeholder:text-[var(--glass-text-dimmer)] placeholder:italic p-3 focus:border-[rgba(224,48,96,0.5)] transition-colors"
            />
            <div className="text-xs text-[var(--glass-text-dimmer)] mt-2 leading-relaxed italic">
              These won&apos;t affect your mission. They&apos;ll be here after you ship.
            </div>
          </div>
        </div>
      </div>

      {showArtifactModal && (
        <ArtifactUploadModal
          missionId={mission.missionId}
          onUploadSuccess={handleArtifactUploadSuccess}
          onCancel={() => setShowArtifactModal(false)}
        />
      )}
    </>
  );
}
