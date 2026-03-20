'use client';

import React from 'react';
import { ArchetypeProfile as ArchetypeProfileType } from '@/lib/actions/assessment';
import { default_palette as theme } from '@/lib/theme';

interface ArchetypeProfileProps {
  profile: ArchetypeProfileType;
}

export default function ArchetypeProfile({ profile }: ArchetypeProfileProps) {
  const cssVars = {
    '--color-primary': theme.primary,
    '--color-base': theme.base,
    '--color-neutral': theme.neutral,
    '--color-border': theme.border,
  } as React.CSSProperties;

  // All 8 archetypes with their scores
  const archetypeScores = [
    { label: 'Optimizer',  value: profile.scores.optimizer },
    { label: 'Strategist', value: profile.scores.strategist },
    { label: 'Visionary',  value: profile.scores.visionary },
    { label: 'Advocate',   value: profile.scores.advocate },
    { label: 'Politician', value: profile.scores.politician },
    { label: 'Empath',     value: profile.scores.empath },
    { label: 'Builder',    value: profile.scores.builder },
    { label: 'Stabilizer', value: profile.scores.stabilizer },
  ];

  const maxScore = Math.max(...archetypeScores.map((a) => a.value), 1);

  return (
    <div
      style={cssVars}
      className="min-h-screen bg-(--color-base) flex flex-col items-center justify-center px-4 py-12 font-inter"
    >
      <div className="max-w-3xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-(--color-neutral) uppercase tracking-widest mb-2">
            Your Archetype
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-(--color-primary) mb-6 leading-tight">
            {profile.name}
          </h1>
          <p className="text-xl md:text-2xl text-(--color-neutral) font-semibold mb-4">
            {profile.tagline}
          </p>
          <p className="text-lg text-(--color-neutral) leading-relaxed">
            {profile.description}
          </p>
        </div>

        {/* Archetype Score Breakdown */}
        <div className="bg-white border-2 border-(--color-border) rounded-xl p-8 md:p-10 mb-8">
          <h2 className="text-2xl font-bold text-(--color-primary) mb-8">Your Archetype Scores</h2>

          <div className="space-y-6">
            {archetypeScores.map((archetype) => {
              const percentage = (archetype.value / maxScore) * 100;
              const isWinner = archetype.label === profile.name.replace('The ', '');
              return (
                <div key={archetype.label} className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className={`text-lg font-semibold ${isWinner ? 'text-(--color-primary)' : 'text-(--color-neutral)'}`}>
                      {archetype.label}
                    </span>
                    <span className="text-sm text-(--color-neutral)/70">
                      {archetype.value}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-(--color-border) rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isWinner ? 'bg-(--color-primary)' : 'bg-(--color-neutral)/40'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Steps Placeholder */}
        <div className="text-center">
          <p className="text-sm text-(--color-neutral)/70 mb-4">
            Your first mission is being prepared...
          </p>
        </div>
      </div>
    </div>
  );
}
