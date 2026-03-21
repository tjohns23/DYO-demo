'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArchetypeProfile as ArchetypeProfileType } from '@/lib/actions/assessment';
import { default_palette as theme } from '@/lib/theme';
import { Button } from '@/components/ui/button';

interface ArchetypeProfileProps {
  profile: ArchetypeProfileType;
}

export default function ArchetypeProfile({ profile }: ArchetypeProfileProps) {
  const [showTransition, setShowTransition] = useState(false);
  const router = useRouter();

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

  if (showTransition) {
    return (
      <div
        style={cssVars}
        className="min-h-screen bg-(--color-base) flex flex-col items-center justify-center px-4 py-12 font-inter"
      >
        <div className="max-w-xl w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-bold text-(--color-primary) mb-6 leading-tight">
            Now you know why you stall. Let&apos;s get you unstuck.
          </h1>
          <p className="text-lg text-(--color-neutral) leading-relaxed mb-12">
            Understanding your archetype isn&apos;t about self-knowledge—it&apos;s about designing constraints that actually work for how you&apos;re wired.
          </p>
          <Button
            onClick={() => router.push('/mission')}
            className="bg-(--color-primary) text-white text-lg font-semibold px-10 py-4 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Get Your First Mission
          </Button>
        </div>
      </div>
    );
  }

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

        <div className="text-center">
          <button
            onClick={() => setShowTransition(true)}
            className="bg-(--color-primary) text-white text-lg font-semibold px-10 py-4 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
