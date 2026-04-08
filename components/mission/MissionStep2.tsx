'use client';

import React from 'react';
import type { GeneratedMission } from './MissionContainer';
import NavHeader from '@/components/NavHeader';

interface MissionStep2Props {
  mission: GeneratedMission;
  onAccept: () => void;
  onRegenerate: () => void;
  archetypeName?: string;
}

export default function MissionStep2({ mission, onAccept, onRegenerate, archetypeName = 'Your Archetype' }: MissionStep2Props) {
  return (
    <>
      <NavHeader activePage="mission" archetypeName={archetypeName} />

      <div className="max-w-xl mx-auto px-5 py-10">
        <div className="border border-[rgba(224,48,96,0.25)] rounded-3xl bg-[rgba(224,48,96,0.06)] px-5.5 py-5 mb-4.5 shadow-[inset_0_0_30px_rgba(224,48,96,0.05)]">
          <div className="font-mono text-xs font-semibold text-[var(--glass-accent)] uppercase tracking-[0.15em] mb-2">
            Pattern Detected
          </div>
          <div className="text-lg font-semibold text-[var(--glass-text-primary)] mb-2">
            {mission.pattern}
          </div>
          <div className="text-sm text-[#9a7080] leading-relaxed">
            You described rewriting and tweaking rather than finishing. This is your most common stall trigger. The mission below is designed to break it.
          </div>
        </div>

        <div className="text-sm italic text-[var(--glass-text-muted)] px-1 mb-4.5 leading-relaxed">
          &quot;{mission.description.length > 80 ? mission.description.slice(0, 80) + '…' : mission.description}&quot;
        </div>

        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl backdrop-blur-3xl p-6.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.3),inset_0_0_40px_rgba(160,30,60,0.08)] mb-4">
          <div className="flex justify-between items-start mb-5">
            <div className="font-mono text-xs font-semibold text-[var(--glass-text-muted)] uppercase tracking-[0.15em]">
              Your Mission
            </div>
            <div className="font-mono text-xs px-3 py-1.25 rounded-full border border-[var(--glass-border)] text-[var(--glass-text-muted)]">
              🔒 Locked once accepted
            </div>
          </div>

          <div className="mb-5">
            <div className="font-mono text-xs font-semibold text-[var(--glass-text-muted)] uppercase tracking-[0.15em] mb-1.5">
              Timebox
            </div>
            <div className="text-4xl font-bold text-[var(--glass-text-primary)] mt-1 tracking-[-0.02em]">
              {mission.timebox} minutes
            </div>
          </div>

          <hr className="border-none border-t border-[var(--glass-grid)] my-5" />

          <div className="mb-5">
            <div className="font-mono text-xs font-semibold text-[var(--glass-text-muted)] uppercase tracking-[0.15em] mb-1.5">
              Scope
            </div>
            <div className="text-base text-[var(--glass-text-primary)] font-medium leading-relaxed">
              {mission.scope}
            </div>
          </div>

          <div className="mb-5">
            <div className="font-mono text-xs font-semibold text-[var(--glass-text-muted)] uppercase tracking-[0.15em] mb-1.5">
              Done When
            </div>
            <div className="text-base text-[var(--glass-text-primary)] font-medium leading-relaxed">
              {mission.completion}
            </div>
          </div>

          <hr className="border-none border-t border-[var(--glass-grid)] my-5" />

          <div>
            <div className="font-mono text-xs font-semibold text-[var(--glass-text-muted)] uppercase tracking-[0.15em] mb-1.5">
              Constraint
            </div>
            <div className="text-base text-[var(--glass-accent)] font-medium leading-relaxed">
              {mission.constraint}
            </div>
          </div>
        </div>

        <div className="text-xs text-[var(--glass-text-dimmer)] text-center mb-4 italic">
          Once you accept, this mission cannot be changed. The lock is the point.
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <button
            onClick={onRegenerate}
            className="px-3 py-3.25 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-surface)] text-[var(--glass-text-muted)] font-mono text-xs font-semibold uppercase tracking-widest cursor-pointer transition-all hover:border-[rgba(224,48,96,0.3)] hover:text-[var(--glass-text-primary)]"
          >
            ↺ Regenerate
          </button>
          <button
            onClick={onAccept}
            className="px-3 py-3.25 rounded-2xl border-none bg-[var(--glass-accent)] text-white font-mono text-xs font-semibold uppercase tracking-widest cursor-pointer transition-all shadow-[0_0_20px_rgba(224,48,96,0.3)] hover:shadow-[0_0_32px_rgba(224,48,96,0.5)] hover:bg-[#f03870]"
          >
            Accept mission →
          </button>
        </div>

        <div className="font-mono text-xs text-[var(--glass-text-dimmer)] text-center">
          You have 1 request remaining.
        </div>
      </div>
    </>
  );
}
