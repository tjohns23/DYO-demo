'use client'

import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { default_palette as theme } from '@/lib/theme';
import ArchetypeProfile from '@/components/assessment/ArchetypeProfile';
import { scoreAssessment, type ArchetypeProfile as ArchetypeProfileType } from '@/lib/actions/assessment';
import {
  CORE_QUESTIONS,
  CORE_OPTIONS,
  CALIBRATION_QUESTIONS,
  CALIBRATION_OPTIONS,
  CalibrationOption,
  CalibrationQuestion,
  CoreOption,
} from '@/lib/config/archetypes';

// --- Component ---

const AssessmentQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [archetypeProfile, setArchetypeProfile] = useState<ArchetypeProfileType | null>(null);
  const [phase, setPhase] = useState<'core' | 'transition' | 'calibration' | 'retake_prompt' | 'done'>('core');

  const handleSelect = (value: number | string) => {
    setAnswers((prev) => {
      const qs = phase === 'core' ? CORE_QUESTIONS : CALIBRATION_QUESTIONS;
      const q = qs[currentStep];
      return { ...prev, [q.id]: value };
    });
  };

  const handleNext = async () => {
    if (phase === 'core') {
      const coreSteps = CORE_QUESTIONS.length;
      if (currentStep < coreSteps - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        setPhase('transition');
      }
    } else if (phase === 'transition') {
      setPhase('calibration');
      setCurrentStep(0);
    } else if (phase === 'calibration') {
      const calibrationSteps = CALIBRATION_QUESTIONS.length;
      if (currentStep < calibrationSteps - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        const coreResponses = Object.entries(answers)
          .filter(([id]) => Number(id) <= 20)
          .map(([id, value]) => ({
            questionId: Number(id),
            rating: value as number,
          }));

        const calibrationResponses = Object.entries(answers)
          .filter(([id]) => Number(id) > 20)
          .map(([id, value]) => ({
            questionId: Number(id),
            value: value,
          }));

        const { profiles, consistencyCheck } = await scoreAssessment(coreResponses);

        const primaryProfile = profiles[0];
        const secondaryProfile = profiles[1];
        const tertiaryProfile = profiles[2];

        const enrichedProfile = {
          ...primaryProfile,
          responses: coreResponses,
          calibrationResponses: calibrationResponses,
          dimensions: primaryProfile.dimensions,
          secondary: secondaryProfile
            ? { slug: secondaryProfile.slug, name: secondaryProfile.name, tagline: secondaryProfile.tagline }
            : undefined,
          tertiary: tertiaryProfile
            ? { slug: tertiaryProfile.slug, name: tertiaryProfile.name, tagline: tertiaryProfile.tagline }
            : undefined,
        };

        localStorage.setItem('pending_assessment', JSON.stringify(enrichedProfile));

        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + 60 * 60 * 1000);
        document.cookie = `pending_assessment=${encodeURIComponent(JSON.stringify(enrichedProfile))}; path=/; expires=${expiryDate.toUTCString()}`;

        if (!consistencyCheck.reliable && !localStorage.getItem('quiz_retake_used')) {
          setArchetypeProfile(enrichedProfile);
          setPhase('retake_prompt');
        } else {
          setArchetypeProfile(enrichedProfile);
        }
      }
    }
  };

  const handleBack = () => {
    if (phase === 'calibration' && currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else if (phase === 'calibration' && currentStep === 0) {
      setPhase('transition');
      setCurrentStep(0);
    } else if (phase === 'transition') {
      setPhase('core');
      setCurrentStep(CORE_QUESTIONS.length - 1);
    } else if (phase === 'core' && currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (archetypeProfile && phase !== 'retake_prompt') {
    return <ArchetypeProfile profile={archetypeProfile} />;
  }

  const cssVars = {
    '--color-primary': theme.primary,
    '--color-base':    '#F5EEED',
    '--color-neutral': theme.neutral,
    '--color-border':  theme.border,
  } as React.CSSProperties;

  // Retake prompt screen
  if (phase === 'retake_prompt') {
    return (
      <div style={cssVars} className="min-h-screen bg-(--color-base) font-inter flex flex-col items-center justify-center px-4">
        <main className="w-full max-w-[520px] flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-[2rem] font-bold text-center text-(--color-primary) leading-tight">
            Some answers seemed inconsistent
          </h1>
          <p className="text-lg text-center text-(--color-neutral) leading-relaxed">
            We noticed a few contradictions in your responses, which may affect the accuracy of your result. You can retake the quiz once for a cleaner read — or keep your current result.
          </p>
          <div className="flex justify-center gap-10 mt-2">
            <button
              onClick={() => setPhase('done')}
              className="rounded-full bg-gray-100 text-gray-500 uppercase text-sm font-semibold px-8 h-12 transition-colors hover:bg-gray-200"
            >
              ← KEEP
            </button>
            <button
              onClick={() => {
                localStorage.setItem('quiz_retake_used', 'true');
                setPhase('core');
                setCurrentStep(0);
                setAnswers({});
                setArchetypeProfile(null);
              }}
              style={{ backgroundColor: 'var(--color-primary)' }}
              className="rounded-full text-white uppercase text-sm font-semibold px-8 h-12 transition-colors shadow-sm"
            >
              RETAKE →
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (phase === 'done') {
    return <ArchetypeProfile profile={archetypeProfile!} />;
  }

  // Transition screen
  if (phase === 'transition') {
    return (
      <div style={cssVars} className="min-h-screen bg-(--color-base) font-inter flex flex-col items-center justify-center px-4">
        <main className="w-full max-w-[520px] flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-[2rem] font-bold text-center text-(--color-primary) leading-tight">
            A few more questions
          </h1>
          <p className="text-lg text-center text-(--color-neutral) leading-relaxed">
            These aren&apos;t part of your archetype assessment—they help us customize constraints to your specific needs.
          </p>
          <button
            onClick={handleNext}
            style={{ backgroundColor: 'var(--color-primary)' }}
            className="rounded-full text-white uppercase text-sm font-semibold px-10 h-12 transition-colors shadow-sm"
          >
            CONTINUE →
          </button>
        </main>
      </div>
    );
  }

  // Get questions and options based on phase
  const questions = phase === 'core' ? CORE_QUESTIONS : CALIBRATION_QUESTIONS;
  const totalSteps = questions.length;
  const question = questions[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const currentOptions = phase === 'core'
    ? CORE_OPTIONS
    : CALIBRATION_OPTIONS[(question as CalibrationQuestion).id] || [];

  const selectedValue = answers[question.id] ?? null;
  const isLastQuestion = currentStep === totalSteps - 1;
  const showBack = phase !== 'core' || currentStep > 0;

  return (
    <div style={cssVars} className="min-h-screen bg-(--color-base) font-inter flex flex-col">

      {/* Sticky Progress Bar */}
      <div className="w-full sticky top-0 bg-(--color-base) z-10">
        <Progress
          value={progress}
          className="h-2 w-full bg-(--color-border) [&>div]:bg-(--color-primary) rounded-none transition-all duration-300"
        />
        <div className="max-w-3xl mx-auto px-4 py-4">
          <span className="text-sm font-medium text-(--color-neutral)">
            {phase === 'core' ? 'Assessment' : 'Calibration'} — Question {currentStep + 1} of {totalSteps}
          </span>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[600px] mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Question Text */}
        <h1 className="text-[2rem] font-bold text-center text-(--color-primary) mb-14 leading-tight">
          &ldquo;{question.text}&rdquo;
        </h1>

        {/* Options */}
        {phase === 'core' ? (
          // Core assessment: numbered circles
          <div className="flex justify-between items-start w-full mb-14">
            {(currentOptions as CoreOption[]).map((option, idx) => (
              <div key={option.value} className="flex flex-col items-center gap-3">
                <button
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-17.5 h-17.5 rounded-full border-2 flex items-center justify-center transition-all
                    ${selectedValue === option.value
                      ? 'border-(--color-primary) text-white'
                      : 'border-gray-200 bg-white text-(--color-neutral) hover:border-(--color-primary)'}
                  `}
                  style={selectedValue === option.value ? { backgroundColor: 'var(--color-primary)' } : {}}
                >
                  <span className="text-base font-medium">{idx + 1}</span>
                </button>
                <span className={`text-xs text-center w-17.5 leading-tight ${selectedValue === option.value ? 'font-bold text-(--color-primary)' : 'text-gray-400'}`}>
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          // Calibration: vertical list
          <div className="w-full space-y-3 mb-14">
            {(currentOptions as CalibrationOption[]).map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all
                  ${selectedValue === option.value
                    ? 'border-(--color-primary) bg-primary/5'
                    : 'border-(--color-border) hover:border-(--color-primary) bg-white'}
                `}
              >
                <span className={`font-medium ${selectedValue === option.value ? 'text-(--color-primary)' : 'text-(--color-neutral)'}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-10">
          {showBack && (
            <button
              onClick={handleBack}
              className="rounded-full bg-gray-100 text-gray-500 uppercase text-sm font-semibold px-8 h-12 transition-colors hover:bg-gray-200"
            >
              ← BACK
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={selectedValue === null}
            style={{ backgroundColor: 'var(--color-primary)' }}
            className="rounded-full text-white uppercase text-sm font-semibold px-8 h-12 transition-colors shadow-sm disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLastQuestion && phase === 'calibration' ? 'FINISH →' : 'NEXT →'}
          </button>
        </div>

      </main>
    </div>
  );
};

export default AssessmentQuiz;
