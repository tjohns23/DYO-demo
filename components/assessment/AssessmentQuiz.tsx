'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { default_palette as theme } from '@/lib/theme';
import ArchetypeTease from '@/components/assessment/ArchetypeTease';
import { scoreAssessment, type ArchetypeProfile } from '@/lib/actions/assessment';

// --- Data ---
// Each question belongs to one of the four scoring dimensions.
// Add, remove, or reword questions here without touching the component logic.
// The dimension field is what drives score calculation later.

type Dimension = 'perfectionism' | 'avoidance' | 'overthinking' | 'scope_creep';

type Question = {
  id: number;
  text: string;
  dimension: Dimension;
};

const QUESTIONS: Question[] = [
  // Perfectionism (5 questions)
  { id: 1,  text: '[Placeholder] I often delay finishing work because it doesn\'t feel good enough yet.',       dimension: 'perfectionism' },
  { id: 2,  text: '[Placeholder] I spend more time refining than I do creating.',                               dimension: 'perfectionism' },
  { id: 3,  text: '[Placeholder] I find it hard to call something "done" without one more revision.',           dimension: 'perfectionism' },
  { id: 4,  text: '[Placeholder] I hold back sharing work because I worry about how it will be received.',     dimension: 'perfectionism' },
  { id: 5,  text: '[Placeholder] I work best when I have clear, time-bound constraints in front of me.',       dimension: 'perfectionism' },

  // Avoidance (5 questions)
  { id: 6,  text: '[Placeholder] I tend to do easier tasks before tackling the most important one.',           dimension: 'avoidance' },
  { id: 7,  text: '[Placeholder] I often feel a vague dread about starting a project I care about.',           dimension: 'avoidance' },
  { id: 8,  text: '[Placeholder] I reorganize or plan instead of doing the actual work.',                      dimension: 'avoidance' },
  { id: 9,  text: '[Placeholder] I frequently tell myself I\'ll start once conditions are better.',            dimension: 'avoidance' },
  { id: 10, text: '[Placeholder] I find it easier to help others make progress than to make my own.',          dimension: 'avoidance' },

  // Overthinking (5 questions)
  { id: 11, text: '[Placeholder] I research topics long past the point where I have enough to act.',           dimension: 'overthinking' },
  { id: 12, text: '[Placeholder] I often think through many possible approaches before choosing one.',         dimension: 'overthinking' },
  { id: 13, text: '[Placeholder] I second-guess decisions I\'ve already made.',                                dimension: 'overthinking' },
  { id: 14, text: '[Placeholder] I find it hard to commit to one direction without knowing all the options.',  dimension: 'overthinking' },
  { id: 15, text: '[Placeholder] I get stuck weighing pros and cons long after a decision should be made.',    dimension: 'overthinking' },

  // Scope Creep (5 questions)
  { id: 16, text: '[Placeholder] My projects tend to grow bigger than I originally intended.',                 dimension: 'scope_creep' },
  { id: 17, text: '[Placeholder] I add features or ideas mid-project that weren\'t part of the original plan.',dimension: 'scope_creep' },
  { id: 18, text: '[Placeholder] I rarely finish a project in its original form.',                             dimension: 'scope_creep' },
  { id: 19, text: '[Placeholder] I find it hard to draw a line between "version 1" and "someday maybe".',     dimension: 'scope_creep' },
  { id: 20, text: '[Placeholder] I often restart projects from scratch rather than ship an imperfect version.',dimension: 'scope_creep' },
];

// Likert scale options are fixed — they don't belong in the questions array.
const OPTIONS = [
  { label: 'Strongly Disagree', value: 1 },
  { label: 'Disagree',          value: 2 },
  { label: 'Neutral',           value: 3 },
  { label: 'Agree',             value: 4 },
  { label: 'Strongly Agree',    value: 5 },
];

// --- Component ---

const AssessmentQuiz = () => {
  // currentStep is a 0-based index into QUESTIONS.
  // Display as "Question X of Y" by adding 1.
  const [currentStep, setCurrentStep] = useState(0);

  // Answers stores every response: { questionId: rating }
  // This persists answers as the user moves forward/back.
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [archetypeProfile, setArchetypeProfile] = useState<ArchetypeProfile | null>(null);

  const totalSteps = QUESTIONS.length;
  const question = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // The selected value for the current question (undefined if not yet answered)
  const selectedValue = answers[question.id] ?? null;

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      const responses = Object.entries(answers).map(([id, rating]) => ({
        questionId: Number(id),
        rating,
      }));
      const profile = await scoreAssessment(responses);
      localStorage.setItem('pending_assessment', JSON.stringify(profile));
      setArchetypeProfile(profile);
    }
  };

  const isLastQuestion = currentStep === totalSteps - 1;

  if (archetypeProfile) {
    return (
      <ArchetypeTease profile={archetypeProfile} />
    );
  }

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
            Question {currentStep + 1} of {totalSteps}
          </span>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[600px] px-4 py-12">

        {/* Question Text */}
        <h1 className="text-2xl md:text-3xl font-semibold text-center text-(--color-primary) mb-12 leading-tight">
          &ldquo;{question.text}&rdquo;
        </h1>

        {/* Likert Scale Options */}
        <div className="w-full space-y-4 md:space-y-0 md:flex md:justify-between md:gap-2 mb-16">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                group flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
                min-h-[56px] w-full md:w-24 text-center
                ${selectedValue === option.value
                  ? 'border-(--color-primary) bg-primary/5'
                  : 'border-(--color-border) hover:border-primary/50 bg-white'}
              `}
            >
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${selectedValue === option.value ? 'border-(--color-primary)' : 'border-(--color-border)'}
              `}>
                {selectedValue === option.value && <div className="w-3 h-3 rounded-full bg-(--color-primary)" />}
              </div>
              <span className={`text-xs font-semibold ${selectedValue === option.value ? 'text-(--color-primary)' : 'text-(--color-neutral)'}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="w-full flex justify-center md:justify-end">
          <Button
            onClick={handleNext}
            disabled={selectedValue === null}
            style={{ backgroundColor: 'var(--color-primary)' }}
            className="w-full md:w-[200px] h-14 text-white rounded-lg text-lg font-semibold transition-colors shadow-sm"
          >
            {isLastQuestion ? 'Finish' : 'Next'}
          </Button>
        </div>

      </main>
    </div>
  );
};

export default AssessmentQuiz;
