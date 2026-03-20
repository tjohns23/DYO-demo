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
  // Perfectionism/Refinement (Optimizer)
  { id: 1, text: 'I often revise my work multiple times before I consider it ready to share.', dimension: 'perfectionism' },
  { id: 2, text: 'I find it harder to decide something is "done" than to actually do the work.', dimension: 'perfectionism' },

  // Systems Thinking/Analysis (Strategist)
  { id: 3, text: 'Before I start a project, I need to understand how all the pieces will fit together.', dimension: 'overthinking' },
  { id: 4, text: 'I struggle to move forward when I don\'t have enough information to make the optimal choice.', dimension: 'overthinking' },

  // Vision/Possibility (Visionary)
  { id: 5, text: 'I\'m energized by imagining what could be, even if I haven\'t finished what currently is.', dimension: 'scope_creep' },
  { id: 6, text: 'I often start new projects before completing previous ones because the new idea feels more exciting.', dimension: 'scope_creep' },

  // Purpose/Values Alignment (Advocate)
  { id: 7, text: 'I can\'t bring myself to work on something if I don\'t understand why it matters.', dimension: 'avoidance' },
  { id: 8, text: 'When my work feels misaligned with my values, I lose all motivation to continue.', dimension: 'avoidance' },

  // Social/Collaborative Energy (Politician)
  { id: 9, text: 'I accomplish more when other people can see my progress or provide feedback.', dimension: 'avoidance' },
  { id: 10, text: 'Working alone for extended periods drains my energy and makes it hard to stay motivated.', dimension: 'avoidance' },

  // Emotional Sensitivity/Safety (Empath)
  { id: 11, text: 'The thought of sharing unfinished work makes me feel vulnerable and exposed.', dimension: 'perfectionism' },
  { id: 12, text: 'Harsh criticism affects my ability to work for longer than most people realize.', dimension: 'scope_creep' },

  // Structure/Process Preference (Builder)
  { id: 13, text: 'I work best when I have clear, step-by-step processes to follow.', dimension: 'overthinking' },
  { id: 14, text: 'Ambiguous projects frustrate me—I need defined inputs and outputs to execute well.', dimension: 'overthinking' },

  // Stability/Clarity Need (Stabilizer)
  { id: 15, text: 'I feel anxious starting work when I\'m unsure what "success" looks like.', dimension: 'avoidance' },
  { id: 16, text: 'I prefer consistent routines and clear expectations over flexibility and autonomy.', dimension: 'avoidance' },

  // Cross-Dimensional Questions (Distinguishing Similar Types)
  { id: 17, text: 'When I\'m stuck, it\'s usually because I\'m trying to make something perfect rather than because I don\'t know how to start.', dimension: 'perfectionism' },
  { id: 18, text: 'I generate ideas faster than I can execute them, and that\'s usually my biggest challenge.', dimension: 'scope_creep' },
  { id: 19, text: 'I need to see the long-term implications of my work before I can commit to doing it.', dimension: 'overthinking' },
  { id: 20, text: 'I\'m more likely to abandon a project because it lost meaning than because it got difficult.', dimension: 'avoidance' },
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
