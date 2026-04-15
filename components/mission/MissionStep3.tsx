'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { GeneratedMission } from './MissionContainer';
import { completeMissionAction, expireMissionAction, saveThoughtParkingAction } from '@/lib/actions/mission';
import NavHeader from '@/components/NavHeader';
import ArtifactUploadModal from './ArtifactUploadModal';

const GRACE_PERIOD = 60;

interface MissionStep3Props {
  mission: GeneratedMission;
  archetypeName?: string;
  isExec?: boolean;
}

export default function MissionStep3({ mission, archetypeName, isExec }: MissionStep3Props) {
  const router = useRouter();
  const total = mission.timebox * 60;

  const [totalSeconds, setTotalSeconds] = useState(() => {
    if (mission.acceptedAt) {
      const elapsed = Math.floor((Date.now() - new Date(mission.acceptedAt).getTime()) / 1000);
      return Math.max(0, total - elapsed);
    }
    return total;
  });

  const [graceSecondsLeft, setGraceSecondsLeft] = useState(() => {
    if (mission.acceptedAt) {
      const elapsed = Math.floor((Date.now() - new Date(mission.acceptedAt).getTime()) / 1000);
      if (elapsed >= total && elapsed < total + GRACE_PERIOD) {
        return total + GRACE_PERIOD - elapsed;
      }
    }
    return 0;
  });

  const finalizedRef = useRef(false);
  const totalSecondsRef = useRef(totalSeconds);
  const graceSecondsRef = useRef(graceSecondsLeft);
  const uploadInProgressRef = useRef(false);
  const graceExpiredRef = useRef(false);

  const [thoughts, setThoughts] = useState(mission.thoughtParking ?? '');
  const thoughtsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showArtifactModal, setShowArtifactModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [thoughtsSaveError, setThoughtsSaveError] = useState<string | null>(null);

  const handleThoughtsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setThoughts(value);
    setThoughtsSaveError(null);
    if (thoughtsDebounceRef.current) clearTimeout(thoughtsDebounceRef.current);
    thoughtsDebounceRef.current = setTimeout(async () => {
      const result = await saveThoughtParkingAction(mission.missionId, value);
      if (!result.success) {
        setThoughtsSaveError(result.error || 'Failed to save thoughts');
      }
    }, 2000);
  };

  useEffect(() => {
    if (!mission.acceptedAt) return;
    const acceptedAtMs = new Date(mission.acceptedAt).getTime();

    const tick = () => {
      const elapsed = Math.floor((Date.now() - acceptedAtMs) / 1000);

      if (elapsed < total) {
        const newTotal = total - elapsed;
        totalSecondsRef.current = newTotal;
        setTotalSeconds(newTotal);
      } else if (elapsed < total + GRACE_PERIOD) {
        const newGrace = total + GRACE_PERIOD - elapsed;
        if (totalSecondsRef.current > 0) {
          totalSecondsRef.current = 0;
          setTotalSeconds(0);
        }
        graceSecondsRef.current = newGrace;
        setGraceSecondsLeft(newGrace);
      } else {
        if (totalSecondsRef.current > 0) { totalSecondsRef.current = 0; setTotalSeconds(0); }
        if (graceSecondsRef.current > 0) { graceSecondsRef.current = 0; setGraceSecondsLeft(0); }
        if (!finalizedRef.current && !uploadInProgressRef.current) {
          finalizedRef.current = true;
          expireMissionAction(mission.missionId);
        } else if (!finalizedRef.current) {
          // Upload is in progress — defer expiry until it resolves
          graceExpiredRef.current = true;
        }
      }
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [mission.missionId, mission.acceptedAt, total]);

  useEffect(() => {
    if (!mission.acceptedAt) return;
    const acceptedAtMs = new Date(mission.acceptedAt).getTime();

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const elapsed = Math.floor((Date.now() - acceptedAtMs) / 1000);
      setTotalSeconds(Math.max(0, total - elapsed));
      if (elapsed >= total) {
        setGraceSecondsLeft(Math.max(0, total + GRACE_PERIOD - elapsed));
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [mission.acceptedAt, total]);

  const isGrace = totalSeconds <= 0 && graceSecondsLeft > 0;
  const isExpired = totalSeconds <= 0 && graceSecondsLeft <= 0;

  const displaySeconds = isGrace ? graceSecondsLeft : totalSeconds;
  const displayTotal = isGrace ? GRACE_PERIOD : total;
  const progress = Math.max(0, displaySeconds / displayTotal);
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;

  const ringColor = isGrace ? '#f59e0b' : '#e03060';
  const ringGlow = isGrace
    ? 'drop-shadow(0 0 6px rgba(245,158,11,0.6))'
    : 'drop-shadow(0 0 6px rgba(224,48,96,0.6))';
  const timerGlow = isGrace
    ? '0 0 30px rgba(245,158,11,0.3)'
    : '0 0 30px rgba(224,48,96,0.3)';

  const circumference = 628;
  const offset = circumference * (1 - progress);

  const handleMarkDone = () => {
    if (finalizedRef.current || isGrace || isExpired) return;
    setElapsedSeconds(total - totalSeconds);
    setShowArtifactModal(true);
  };

  const handleOpenGraceSubmit = () => {
    setElapsedSeconds(total);
    setShowArtifactModal(true);
  };

  const handleArtifactUploadSuccess = async () => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    totalSecondsRef.current = 0;
    graceSecondsRef.current = 0;
    setTotalSeconds(0);
    setGraceSecondsLeft(0);
    setShowArtifactModal(false);
    setCompletionError(null);
    const result = await completeMissionAction(mission.missionId, elapsedSeconds);

    if (!result.success) {
      finalizedRef.current = false;
      setCompletionError(result.error || 'Failed to mark mission as complete');
    } else {
      router.push('/dashboard');
    }
  };

  const handleArtifactCancel = () => {
    setShowArtifactModal(false);
    uploadInProgressRef.current = false;
    // If grace already expired while upload was in progress, expire now
    if (graceExpiredRef.current && !finalizedRef.current) {
      finalizedRef.current = true;
      expireMissionAction(mission.missionId);
    }
  };

  return (
    <>
      <NavHeader
        activePage="mission"
        isExec={isExec}
        rightSlot={
          isExpired ? (
            <div className="font-mono text-xs px-3.5 py-1.5 rounded-full border border-[var(--glass-border)] text-[var(--glass-text-muted)]">
              Mission ended
            </div>
          ) : isGrace ? (
            <div className="font-mono text-xs px-3.5 py-1.5 rounded-full border border-[rgba(245,158,11,0.4)] text-[#f59e0b] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_7px_#f59e0b] animate-pulse" />
              Time&apos;s up — submit now
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
                  stroke={ringColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center',
                    filter: ringGlow,
                    transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
                  }}
                />
              </svg>
              <div className="flex flex-col items-center">
                <div
                  className="font-mono text-5xl font-medium text-[var(--glass-text-primary)] tracking-[-0.02em] leading-none"
                  style={{ textShadow: timerGlow }}
                >
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--glass-text-muted)] mt-1.5">
                  {isGrace ? 'To Submit' : 'Remaining'}
                </div>
              </div>
            </div>
          </div>

          {!isExpired && !isGrace && (
            <button
              onClick={handleMarkDone}
              className="w-full mb-4 px-3.5 py-3 rounded-2xl bg-transparent border border-[var(--glass-success-border)] text-[var(--glass-success)] font-mono text-xs font-semibold uppercase tracking-[0.12em] cursor-pointer transition-all hover:bg-[rgba(61,224,138,0.06)] hover:border-[rgba(61,224,138,0.5)]"
            >
              I shipped it — mark as done
            </button>
          )}

          {isGrace && (
            <button
              onClick={handleOpenGraceSubmit}
              className="w-full mb-4 px-3.5 py-3 rounded-2xl bg-transparent border border-[rgba(245,158,11,0.4)] text-[#f59e0b] font-mono text-xs font-semibold uppercase tracking-[0.12em] cursor-pointer transition-all hover:bg-[rgba(245,158,11,0.06)] hover:border-[rgba(245,158,11,0.6)]"
            >
              Submit artifact now
            </button>
          )}

          <div className="text-sm italic text-[var(--glass-text-muted)] px-1 mb-4 leading-relaxed max-h-24 overflow-y-auto">
            &quot;{mission.description}&quot;
          </div>

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
          {completionError && (
            <div className="bg-[rgba(230,67,76,0.08)] border border-[rgba(230,67,76,0.3)] rounded-2xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="font-mono text-xs text-[#e6434c] font-semibold leading-relaxed">
                ❌ {completionError}
              </div>
            </div>
          )}
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
            {thoughtsSaveError && (
              <div className="text-xs text-[#e6434c] mt-2 leading-relaxed font-mono">
                ⚠️ Failed to save: {thoughtsSaveError}
              </div>
            )}
            {!thoughtsSaveError && (
              <div className="text-xs text-[var(--glass-text-dimmer)] mt-2 leading-relaxed italic">
                These won&apos;t affect your mission. They&apos;ll be here after you ship.
              </div>
            )}
          </div>
        </div>
      </div>

      {showArtifactModal && (
        <ArtifactUploadModal
          missionId={mission.missionId}
          onUploadSuccess={handleArtifactUploadSuccess}
          onCancel={handleArtifactCancel}
          onUploadStart={() => { uploadInProgressRef.current = true; }}
        />
      )}
    </>
  );
}
