'use client';

import React, { useState } from 'react';
import { ArchetypeProfile as ArchetypeProfileType } from '@/lib/actions/assessment';
import { default_palette as theme } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { sendMagicLink } from '@/lib/actions/auth';

interface ArchetypeProfileProps {
  profile: ArchetypeProfileType;
}

export default function ArchetypeProfile({ profile }: ArchetypeProfileProps) {
  const [showTransition, setShowTransition] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSendMagicLink = async () => {
    setError(null);
    setIsLoading(true);
    const result = await sendMagicLink(email, `${window.location.origin}/auth/callback`);
    if (result.success) {
      setSuccess(true);
      setEmail('');
    } else {
      setError(result.error || 'Failed to send magic link.');
    }
    setIsLoading(false);
  };

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
      {/* Profile Screen */}
      <div className={`fixed inset-0 overflow-y-auto px-4 py-12 transition-opacity duration-500 ${showTransition ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="max-w-3xl w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
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

          {profile.secondary && (
            <div className="border-t border-(--color-border) pt-8 mb-16 text-center">
              <p className="text-sm font-semibold text-(--color-neutral) uppercase tracking-widest mb-3">
                You&apos;re also
              </p>
              <h2 className="text-3xl font-bold text-(--color-primary) mb-4">
                {profile.secondary.name}
              </h2>
              <p className="text-lg text-(--color-neutral) leading-relaxed">
                You don&apos;t fit neatly into one box—and that&apos;s actually your strength. Your {profile.slug} side drives your core execution pattern, but your {profile.secondary.slug} side shows up too.
              </p>
            </div>
          )}

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

      {/* Transition Screen */}
      <div className={`fixed inset-0 flex flex-col items-center justify-center px-4 py-12 transition-opacity duration-500 ${showTransition ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`max-w-xl w-full text-center ${showTransition ? 'animate-in fade-in slide-in-from-bottom-4' : ''} duration-500`}>
          {!showLogin ? (
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-(--color-primary) mb-6 leading-tight">
                Now you know why you stall. Let&apos;s get you unstuck.
              </h1>
              <p className="text-lg text-(--color-neutral) leading-relaxed mb-12">
                Understanding your archetype isn&apos;t about self-knowledge—it&apos;s about designing constraints that actually work for how you&apos;re wired.
              </p>
              <Button
                onClick={() => setShowLogin(true)}
                className="bg-(--color-primary) text-white text-lg font-semibold px-10 py-4 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Get Your First Mission
              </Button>
            </>
          ) : (
            <Card className="bg-white border-(--color-border) p-8 md:p-10 shadow-sm rounded-xl text-left">
              {success ? (
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-(--color-primary) mb-2">
                    Check your email!
                  </h3>
                  <p className="text-(--color-neutral)">
                    We&apos;ve sent you a magic link. Click it to start your first mission.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-(--color-primary) mb-2">
                    Want to get your first mission?
                  </h3>
                  <p className="text-(--color-neutral) mb-6">
                    Enter your email to start shipping.
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="h-12 border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)"
                      />
                      {error && <p className="text-xs text-red-600">{error}</p>}
                      {!error && (
                        <p className="text-xs text-(--color-neutral)/70 italic">
                          No password needed. We&apos;ll send you a magic link.
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleSendMagicLink}
                      disabled={isLoading || !email.trim()}
                      className="w-full h-14 bg-(--color-primary) hover:bg-(--color-primary)/90 text-white text-lg font-bold transition-transform active:scale-95"
                    >
                      {isLoading ? 'Sending...' : 'SEND MAGIC LINK'}
                    </Button>
                  </div>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
