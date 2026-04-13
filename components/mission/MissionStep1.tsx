'use client';

import React, { useState, useEffect } from 'react';
import type { GeneratedMission } from './MissionContainer';
import type { Mission } from '@/lib/mission/missionEngine';
import { generateMissionAction } from '@/lib/actions/mission';
import NavHeader from '@/components/NavHeader';

const STORAGE_KEY = 'mission_description';

interface MissionStep1Props {
  onMissionGenerated: (mission: GeneratedMission, fullMission: Mission, workDescription: string) => void;
  archetypeName?: string;
  isExec?: boolean;
}

export default function MissionStep1({ onMissionGenerated, archetypeName = 'Your Archetype', isExec }: MissionStep1Props) {
  const [description, setDescription] = useState('');

  useEffect(() => {
    // Load description from sessionStorage on mount
    const savedDescription = sessionStorage.getItem(STORAGE_KEY);
    if (savedDescription) {
      setDescription(savedDescription);
    }
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exampleChips = [
    'I keep tweaking instead of shipping',
    'I\'ve rewritten this email 6 times',
    'My design is "almost" done for weeks',
    'I can\'t stop adding scope to this project',
    'I avoid starting because I\'m not sure it\'ll be good enough',
    'I keep postponing the launch',
  ];

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      // Call mission engine via server action
      const result = await generateMissionAction(description);

      if (!result.success || !result.mission) {
        setError(result.error || 'Failed to generate mission');
        return;
      }

      // Transform engine Mission to GeneratedMission interface
      const generatedMission: GeneratedMission = {
        missionId: result.mission.missionId,
        description: description,
        pattern: result.mission.pattern,
        patternDetected: result.mission.patternDetected,
        framing: result.mission.framing,
        timebox: result.mission.timebox,
        scope: result.mission.scope,
        completion: result.mission.completion,
        constraint: result.mission.constraintRule,
      };

      // Clear sessionStorage after successful mission generation
      sessionStorage.removeItem(STORAGE_KEY);

      onMissionGenerated(generatedMission, result.mission, description);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Mission generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (chip: string) => {
    setDescription(chip);
  };

  return (
    <>
      <NavHeader activePage="mission" archetypeName={archetypeName} isExec={isExec} />

      <div className="max-w-xl mx-auto px-5 py-10">
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl backdrop-blur-3xl p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.3),inset_0_0_40px_rgba(160,30,60,0.08)]">
          <div className="font-mono text-xs font-semibold text-[var(--glass-text-muted)] uppercase tracking-[0.18em] mb-3.5">
            New Mission
          </div>

          <h1 className="text-3xl font-semibold text-[var(--glass-text-primary)] mb-2.5 leading-tight tracking-[-0.02em]">
            What are you working on?
          </h1>

          <p className="text-base text-[var(--glass-text-muted)] mb-6 leading-relaxed">
            Give us a brain dump — describe the work, where you&apos;re stuck, or what you&apos;re trying to finish. Don&apos;t overthink it.
          </p>

          {/* <div className="flex gap-2.5 bg-[var(--glass-accent-faint)] border border-[var(--glass-accent-border-faint)] rounded-2xl p-3.5 mb-5">
            <div className="w-4.5 h-4.5 rounded-full border border-[var(--glass-accent-border)] text-[var(--glass-accent)] text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
              i
            </div>
            <div className="text-sm text-[#c08090] leading-relaxed">
              As <strong className="text-[var(--glass-accent)] font-semibold">{archetypeName}</strong>, your mission will include a hard ship constraint. Be honest about where you&apos;re really stuck — the more specific, the better the mission.
            </div>
          </div> */}

          {error && (
            <div className="flex gap-2.5 bg-[rgba(220,100,100,0.12)] border border-[rgba(220,100,100,0.2)] rounded-2xl p-3.5 mb-5">
              <div className="w-4.5 h-4.5 rounded-full border border-[rgba(220,100,100,0.5)] text-red-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                ⚠
              </div>
              <div className="text-sm text-red-300 leading-relaxed">
                {error}
              </div>
            </div>
          )}

          <div className="border border-[var(--glass-border)] rounded-2xl bg-[rgba(255,255,255,0.025)] overflow-hidden transition-all focus-within:border-[rgba(224,48,96,0.35)] focus-within:shadow-[0_0_0_3px_rgba(224,48,96,0.06)]">
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                // Save to sessionStorage on each change
                sessionStorage.setItem(STORAGE_KEY, e.target.value);
              }}
              placeholder="e.g. I keep rewriting my intro slides and can&apos;t stop tweaking them. The deck is basically done but I can&apos;t bring myself to send it…"
              maxLength={500}
              className="w-full min-h-35 bg-transparent border-none outline-none resize-none p-4.5 font-sans text-sm text-[var(--glass-text-primary)] leading-relaxed placeholder:text-[var(--glass-text-dimmer)] placeholder:italic"
            />
            <div className="font-mono text-xs text-[var(--glass-text-dimmer)] text-right px-3.5 pb-2.5">
              {description.length} / 500
            </div>
          </div>

          <div className="font-mono text-xs font-semibold text-[var(--glass-text-dimmer)] uppercase tracking-[0.15em] mt-6 mb-2.5">
            Try one of these
          </div>

          <div className="flex flex-wrap gap-2 mb-7">
            {exampleChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="text-xs text-[var(--glass-text-muted)] border border-[var(--glass-border)] rounded-full px-3.5 py-1.75 bg-[rgba(255,255,255,0.02)] hover:border-[var(--glass-accent-border)] hover:text-[var(--glass-text-primary)] hover:bg-[rgba(224,48,96,0.06)] transition-all leading-relaxed"
              >
                {chip}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!description.trim() || isLoading}
            className="w-full mt-7 px-3.5 py-3.5 rounded-2xl bg-[var(--glass-accent)] border-none text-white font-mono text-xs font-semibold uppercase tracking-[0.12em] cursor-pointer transition-all shadow-[0_0_24px_rgba(224,48,96,0.3)] hover:shadow-[0_0_36px_rgba(224,48,96,0.45)] hover:bg-[#f03870] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate my mission →'}
          </button>
        </div>
      </div>
    </>
  );
}
