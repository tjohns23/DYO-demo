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

  const dimensions = [
    {
      label: 'Perfectionism',
      value: profile.scores.perfectionism,
      max: 25,
    },
    {
      label: 'Avoidance',
      value: profile.scores.avoidance,
      max: 25,
    },
    {
      label: 'Overthinking',
      value: profile.scores.overthinking,
      max: 25,
    },
    {
      label: 'Scope Creep',
      value: profile.scores.scopeCreep,
      max: 25,
    },
  ];

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

        {/* Dimensional Breakdown */}
        <div className="bg-white border-2 border-(--color-border) rounded-xl p-8 md:p-10 mb-8">
          <h2 className="text-2xl font-bold text-(--color-primary) mb-8">Your Dimensional Profile</h2>

          <div className="space-y-8">
            {dimensions.map((dim) => {
              const percentage = (dim.value / dim.max) * 100;
              return (
                <div key={dim.label} className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold text-(--color-neutral)">
                      {dim.label}
                    </span>
                    <span className="text-sm text-(--color-neutral)/70">
                      {dim.value} / {dim.max}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-(--color-border) rounded-full overflow-hidden">
                    <div
                      className="h-full bg-(--color-primary) rounded-full transition-all duration-500"
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
