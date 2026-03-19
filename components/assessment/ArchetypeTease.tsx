'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { sendMagicLink } from '@/lib/actions/auth';
import { ArchetypeProfile } from '@/lib/actions/assessment';

interface ArchetypeTeaseProps {
  profile: ArchetypeProfile;
}

export default function ArchetypeTease({ profile }: ArchetypeTeaseProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Store the profile in cookies so the auth callback can access it
  useEffect(() => {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + 60 * 60 * 1000); // 1 hour
    document.cookie = `pending_assessment=${encodeURIComponent(JSON.stringify(profile))}; path=/; expires=${expiryDate.toUTCString()}`;
  }, [profile]);

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
          Youre a {profile.name}.
        </h1>

        {/* Supporting Description */}
        <p className="text-lg md:text-xl text-(--color-neutral) mb-12 leading-relaxed">
          {profile.description}
        </p>

        {/* Email Gate Card */}
        <Card className="bg-white border-(--color-border) p-8 md:p-10 shadow-sm rounded-xl text-left">
          {success ? (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-(--color-primary) mb-2">
                Check your email!
              </h3>
              <p className="text-(--color-neutral)">
                Weve sent you a magic link. Click it to unlock your full archetype profile and mission.
              </p>
            </div>
          ) : (
            <>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-12 border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)"
                  />
                  {error && (
                    <p className="text-xs text-red-600">
                      {error}
                    </p>
                  )}
                  {!error && (
                    <p className="text-xs text-(--color-neutral)/70 italic">
                      No password needed. Well send you a magic link.
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSendMagicLink}
                  disabled={isLoading || !email.trim()}
                  className="w-full h-14 bg-(--color-primary) hover:bg-(--color-primary)/90 text-white text-lg font-bold transition-transform active:scale-95"
                >
                  {isLoading ? 'Sending...' : 'UNLOCK FULL ACCESS'}
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Footnote */}
        <p className="mt-8 text-sm text-(--color-neutral)/60">
          The finish line keeps moving. DYO helps you cross it.
        </p>
      </div>
    </div>
  );
}