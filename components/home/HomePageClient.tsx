'use client';

import { useState } from 'react';

export default function HomePageClient() {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      // Todo: Save the check-in (sentiment analysis, storage, etc.)
      setSubmitted(true);
      setTimeout(() => {
        setInput('');
        setSubmitted(false);
      }, 2000);
    }
  };

  return (
    <div className="pt-10">
      <div className="bg-(--glass-surface) border border-(--glass-border) rounded-2xl backdrop-blur-3xl p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.3),inset_0_0_40px_rgba(160,30,60,0.08)]">

        <div className="font-mono text-xs font-semibold text-(--glass-text-muted) uppercase tracking-[0.18em] mb-3.5">
          Daily Check-in
        </div>

        <h1 className="text-3xl font-semibold text-(--glass-text-primary) mb-2.5 leading-tight tracking-[-0.02em]">
          How are you feeling?
        </h1>

        <p className="text-base text-(--glass-text-muted) mb-6 leading-relaxed">
          Let it out. What&apos;s on your mind right now?
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="border border-(--glass-border) rounded-2xl bg-[rgba(255,255,255,0.025)] overflow-hidden transition-all focus-within:border-[rgba(224,48,96,0.35)] focus-within:shadow-[0_0_0_3px_rgba(224,48,96,0.06)]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. I'm feeling okay, a bit overwhelmed with work but excited for the weekend!"
              className="w-full min-h-70 bg-transparent border-none outline-none resize-none p-4 font-sans text-sm text-(--glass-text-primary) leading-relaxed placeholder:text-(--glass-text-dimmer) placeholder:italic"
            />
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button
              type="submit"
              disabled={!input.trim() || submitted}
              className="w-full px-3.5 py-3.5 rounded-2xl bg-(--glass-accent) border-none text-white font-mono text-xs font-semibold uppercase tracking-[0.12em] cursor-pointer transition-all shadow-[0_0_24px_rgba(224,48,96,0.3)] hover:shadow-[0_0_36px_rgba(224,48,96,0.45)] hover:bg-[#f03870] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitted ? '✓ Saved' : 'Submit check-in →'}
            </button>
          </div>

          {submitted && (
            <p className="text-(--glass-text-muted) text-xs text-center font-mono">
              Check-in saved. Your thoughts shape your next mission.
            </p>
          )}
        </form>

      </div>
    </div>
  );
}
