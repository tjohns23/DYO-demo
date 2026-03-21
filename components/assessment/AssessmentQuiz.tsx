'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { default_palette as theme } from '@/lib/theme';
import ArchetypeTease from '@/components/assessment/ArchetypeTease';
import { scoreAssessment, type ArchetypeProfile } from '@/lib/actions/assessment';
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
  // currentStep is a 0-based index into QUESTIONS.
  // Display as "Question X of Y" by adding 1.
  const [currentStep, setCurrentStep] = useState(0);

  // Answers stores every response: { questionId: rating or value }
  // This persists answers as the user moves forward/back.
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [archetypeProfile, setArchetypeProfile] = useState<ArchetypeProfile | null>(null);
  const [phase, setPhase] = useState<'core' | 'transition' | 'calibration'>('core');

  const handleSelect = (value: number | string) => {
    // handleSelect needs to update answers - will use question.id when called
    // Delayed evaluation of question.id
    setAnswers((prev) => {
      const qs = phase === 'core' ? CORE_QUESTIONS : CALIBRATION_QUESTIONS;
      const q = qs[currentStep];
      return { ...prev, [q.id]: value };
    });
  };

  const handleNext = async () => {
    if (phase === 'core') {
      // Calculate totalSteps for core phase
      const coreSteps = CORE_QUESTIONS.length;
      if (currentStep < coreSteps - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // Last core question answered, move to transition
        setPhase('transition');
      }
    } else if (phase === 'transition') {
      // Transition complete, move to calibration questions
      setPhase('calibration');
      setCurrentStep(0);
    } else if (phase === 'calibration') {
      // Calculate totalSteps for calibration phase
      const calibrationSteps = CALIBRATION_QUESTIONS.length;
      if (currentStep < calibrationSteps - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // All questions complete, score assessment
        // Separate core (1-20) and calibration (21+) responses
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

        // Score using only core responses
        const profiles = await scoreAssessment(coreResponses);
        
        // Extract primary archetype profile
        const primaryProfile = profiles[0];
        
        // Store both core and calibration responses in profile
        const enrichedProfile = {
          ...primaryProfile,
          responses: coreResponses,
          calibrationResponses: calibrationResponses,
        };

        localStorage.setItem('pending_assessment', JSON.stringify(enrichedProfile));
        setArchetypeProfile(enrichedProfile);
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

  if (archetypeProfile) {
    return (
      <ArchetypeTease profile={archetypeProfile} />
    );
  }

  // Transition screen - check before calculating questions
  if (phase === 'transition') {
    return (
      <div style={{
        '--color-primary': theme.primary,
        '--color-base': theme.base,
        '--color-neutral': theme.neutral,
        '--color-border': theme.border,
      } as React.CSSProperties} className="min-h-screen bg-(--color-base) font-inter flex flex-col items-center justify-center px-4">
        <main className="max-w-[600px] flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl md:text-4xl font-semibold text-center text-(--color-primary)">
            A few more questions
          </h1>
          <p className="text-lg text-center text-(--color-neutral) leading-relaxed">
            These aren&apos;t part of your archetype assessment—they help us customize constraints to your specific needs.
          </p>
          <Button
            onClick={handleNext}
            style={{ backgroundColor: 'var(--color-primary)' }}
            className="w-full md:w-[200px] h-14 text-white rounded-lg text-lg font-semibold transition-colors shadow-sm"
          >
            Continue
          </Button>
        </main>
      </div>
    );
  }

  // Get questions and options based on phase
  const questions = phase === 'core' ? CORE_QUESTIONS : CALIBRATION_QUESTIONS;
  const totalSteps = questions.length;
  const question = questions[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Get options for current question (calibration questions have per-question options)
  const isLikertQuestion = phase === 'calibration' && (question as CalibrationQuestion).type === 'likert';
  const currentOptions = phase === 'core' 
    ? CORE_OPTIONS 
    : CALIBRATION_OPTIONS[(question as CalibrationQuestion).id] || [];

  // The selected value for the current question (undefined if not yet answered)
  const selectedValue = answers[question.id] ?? null;

  const isLastQuestion = currentStep === totalSteps - 1;

  // CSS variables are set once here on the root element.
  // To switch palettes at runtime, swap out this object — every color in the
  // component updates automatically because they all reference these vars.
  const cssVars = {
    '--color-primary':   theme.primary,
    '--color-base':      theme.base,
    '--color-neutral':   theme.neutral,
    '--color-border':    theme.border,
  } as React.CSSProperties;

  return (
    <div style={cssVars} className="min-h-screen bg-(--color-base) font-inter flex flex-col items-center">

      {/* Progress Bar Header */}
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

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[600px] px-4 py-12">

        {/* Question Text */}
        <h1 className="text-2xl md:text-3xl font-semibold text-center text-(--color-primary) mb-12 leading-tight">
          &ldquo;{question.text}&rdquo;
        </h1>

        {/* Options - Layout varies by type */}
        {isLikertQuestion ? (
          // Likert scale (vertical for clarity)
          <div className="w-full space-y-3 mb-16">
            {(currentOptions as CoreOption[]).map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all
                  ${selectedValue === option.value
                    ? 'border-(--color-primary) bg-primary/5'
                    : 'border-(--color-border) hover:border-primary/50 bg-white'}
                `}
              >
                <span className={`font-medium ${selectedValue === option.value ? 'text-(--color-primary)' : 'text-(--color-neutral)'}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          // Multiple choice or core likert (horizontal for core, can adapt later)
          <div className={`w-full ${phase === 'core' ? 'space-y-4 md:space-y-0 md:flex md:justify-between md:gap-2' : 'space-y-3'} mb-16`}>
            {(currentOptions as (CoreOption | CalibrationOption)[]).map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  ${phase === 'core' ? 'group flex flex-col items-center gap-3 p-4 rounded-xl min-h-[56px] w-full md:w-24 text-center' : 'w-full p-4 rounded-lg text-left'}
                  border-2 transition-all
                  ${selectedValue === option.value
                    ? 'border-(--color-primary) bg-primary/5'
                    : 'border-(--color-border) hover:border-primary/50 bg-white'}
                `}
              >
                {phase === 'core' && (
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${selectedValue === option.value ? 'border-(--color-primary)' : 'border-(--color-border)'}
                  `}>
                    {selectedValue === option.value && <div className="w-3 h-3 rounded-full bg-(--color-primary)" />}
                  </div>
                )}
                <span className={`${phase === 'core' ? 'text-xs font-semibold' : 'font-medium'} ${selectedValue === option.value ? 'text-(--color-primary)' : 'text-(--color-neutral)'}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="w-full flex justify-between md:justify-end md:gap-4">
          {(phase !== 'core' || currentStep > 0) ? (
            <Button
              onClick={handleBack}
              variant="outline"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-neutral)' }}
              className="w-full md:w-30 h-14 rounded-lg text-lg font-semibold transition-colors"
            >
              Back
            </Button>
          ) : (
            <div className="hidden md:block md:w-30" />
          )}
          <Button
            onClick={handleNext}
            disabled={selectedValue === null}
            style={{ backgroundColor: 'var(--color-primary)' }}
            className="w-full md:w-[200px] h-14 text-white rounded-lg text-lg font-semibold transition-colors shadow-sm"
          >
            {isLastQuestion && phase === 'calibration' ? 'Finish' : 'Next'}
          </Button>
        </div>

      </main>
    </div>
  );
};

export default AssessmentQuiz;
