import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface ArchetypeTeaseProps {
  archetype: string; // e.g., "Perfectionist"
  description: string;
}

export default function ArchetypeTease({ archetype, description }: ArchetypeTeaseProps) {
  return (
    <div className="min-h-screen bg-(--color-base) flex flex-col items-center justify-center px-4 py-12 text-center font-sans">
      <div className="max-w-[700px] w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Progress Indicator (Static/Finished) */}
        <p className="text-sm font-semibold text-(--color-neutral) uppercase tracking-widest mb-2">
          Assessment Complete
        </p>
        <h2 className="text-xs font-bold text-(--color-neutral)/60 mb-8 tracking-tighter">
          YOUR RESULT
        </h2>

        {/* Hero Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-(--color-primary) mb-6 leading-tight">
          Youre a {archetype}.
        </h1>

        {/* Supporting Description */}
        <p className="text-lg md:text-xl text-(--color-neutral) mb-12 leading-relaxed">
          {description}
        </p>

        {/* Email Gate Card */}
        <Card className="bg-white border-(--color-border) p-8 md:p-10 shadow-sm rounded-xl text-left">
          <h3 className="text-xl font-semibold text-(--color-primary) mb-2">
            Want to get your first mission?
          </h3>
          <p className="text-(--color-neutral) mb-6">
            Enter your email to unlock your full archetype profile and start shipping.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="you@example.com"
                className="h-12 border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)"
              />
              <p className="text-xs text-(--color-neutral)/70 italic">
                No password needed. Well send you a magic link.
              </p>
            </div>

            <Button className="w-full h-14 bg-(--color-primary) hover:bg-(--color-primary)/90 text-white text-lg font-bold transition-transform active:scale-95">
              UNLOCK FULL ACCESS
            </Button>
          </div>
        </Card>

        {/* Footnote */}
        <p className="mt-8 text-sm text-(--color-neutral)/60">
          The finish line keeps moving. DYO helps you cross it.
        </p>
      </div>
    </div>
  );
}