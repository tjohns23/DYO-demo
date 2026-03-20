'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { default_palette as theme } from '@/lib/theme';
import ArchetypeTease from '@/components/assessment/ArchetypeTease';
import { scoreAssessment, type ArchetypeProfile } from '@/lib/actions/assessment';



/**************************************************
 * Core Assessment - Used for archetype scoring    *
 **************************************************/
type coreQuestion = {
  id: number;
  text: string;
};

// Likert scale options are fixed — they don't belong in the questions array.
type CoreOption = { label: string; value: number };

const CORE_OPTIONS: CoreOption[] = [
  { label: 'Strongly Disagree', value: 1 },
  { label: 'Disagree',          value: 2 },
  { label: 'Neutral',           value: 3 },
  { label: 'Agree',             value: 4 },
  { label: 'Strongly Agree',    value: 5 },
];

const CORE_QUESTIONS: coreQuestion[] = [
  // Perfectionism/Refinement (Optimizer)
  { id: 1, text: 'I often revise my work multiple times before I consider it ready to share.' },
  { id: 2, text: 'I find it harder to decide something is "done" than to actually do the work.' },

  // Systems Thinking/Analysis (Strategist)
  { id: 3, text: 'Before I start a project, I need to understand how all the pieces will fit together.' },
  { id: 4, text: 'I struggle to move forward when I don\'t have enough information to make the optimal choice.' },

  // Vision/Possibility (Visionary)
  { id: 5, text: 'I\'m energized by imagining what could be, even if I haven\'t finished what currently is.' },
  { id: 6, text: 'I often start new projects before completing previous ones because the new idea feels more exciting.' },

  // Purpose/Values Alignment (Advocate)
  { id: 7, text: 'I can\'t bring myself to work on something if I don\'t understand why it matters.' },
  { id: 8, text: 'When my work feels misaligned with my values, I lose all motivation to continue.' },

  // Social/Collaborative Energy (Politician).
  { id: 9, text: 'I accomplish more when other people can see my progress or provide feedback.' },
  { id: 10, text: 'Working alone for extended periods drains my energy and makes it hard to stay motivated.' },

  // Emotional Sensitivity/Safety (Empath)
  { id: 11, text: 'The thought of sharing unfinished work makes me feel vulnerable and exposed.' },
  { id: 12, text: 'Harsh criticism affects my ability to work for longer than most people realize.' },

  // Structure/Process Preference (Builder)
  { id: 13, text: 'I work best when I have clear, step-by-step processes to follow.' },
  { id: 14, text: 'Ambiguous projects frustrate me—I need defined inputs and outputs to execute well.' },

  // Stability/Clarity Need (Stabilizer)
  { id: 15, text: 'I feel anxious starting work when I\'m unsure what "success" looks like.' },
  { id: 16, text: 'I prefer consistent routines and clear expectations over flexibility and autonomy.' },

  // Cross-Dimensional Questions (Distinguishing Similar Types)
  { id: 17, text: 'When I\'m stuck, it\'s usually because I\'m trying to make something perfect rather than because I don\'t know how to start.' },
  { id: 18, text: 'I generate ideas faster than I can execute them, and that\'s usually my biggest challenge.' },
  { id: 19, text: 'I need to see the long-term implications of my work before I can commit to doing it.' },
  { id: 20, text: 'I\'m more likely to abandon a project because it lost meaning than because it got difficult.' },
];


/*****************************************************
 * Calibration Questions - Used for adjusting scores *
 *****************************************************/

type CalibrationQuestion = {
  id: number;
  text: string;
  type: 'likert' | 'multiple-choice';
};

const CALIBRATION_QUESTIONS: CalibrationQuestion[] = [
  // Neurodivergence - ADHD
  {
    id: 21,
    text: 'I have been diagnosed with or strongly identify with having ADHD.',
    type: 'multiple-choice',
  },

  // Neurodivergence - Autism
  {
    id: 22,
    text: 'I have been diagnosed with or strongly identify with being autistic or on the autism spectrum.',
    type: 'multiple-choice',
  },

  // Mental Health - Anxiety
  {
    id: 23,
    text: 'My anxiety level significantly affects my ability to start or complete work.',
    type: 'likert',
  },

  // Learning Style
  {
    id: 24,
    text: 'I learn and process information best through:',
    type: 'multiple-choice',
  },

  // Primary Obstacle
  {
    id: 25,
    text: 'Right now, my biggest obstacle to finishing work is:',
    type: 'multiple-choice',
  },
];

// Calibration question options (mapped by question ID)
type CalibrationOption = { label: string; value: string | number };
type CalibrationOptions = Record<number, CalibrationOption[]>;

const CALIBRATION_OPTIONS: CalibrationOptions = {
  21: [ // ADHD
    { label: 'Not at all / doesn\'t apply to me', value: 'adhd_none' },
    { label: 'Undiagnosed but I suspect I might have it', value: 'adhd_suspected' },
    { label: 'Self-diagnosed based on research and symptoms', value: 'adhd_self_diagnosed' },
    { label: 'Professionally diagnosed, not currently treated', value: 'adhd_diagnosed_untreated' },
    { label: 'Professionally diagnosed and actively treated/managed', value: 'adhd_diagnosed_treated' },
  ],
  22: [ // Autism
    { label: 'Not at all / doesn\'t apply to me', value: 'autism_none' },
    { label: 'Undiagnosed but I suspect I might be', value: 'autism_suspected' },
    { label: 'Self-diagnosed based on research and symptoms', value: 'autism_self_diagnosed' },
    { label: 'Professionally diagnosed', value: 'autism_diagnosed' },
    { label: 'Professionally diagnosed, significantly impacts how I work', value: 'autism_diagnosed_impact' },
  ],
  23: [ // Anxiety - Likert scale
    { label: 'Rarely or never', value: 1 },
    { label: 'Occasionally (a few times a month)', value: 2 },
    { label: 'Sometimes (a few times a week)', value: 3 },
    { label: 'Frequently (most days)', value: 4 },
    { label: 'Almost always (daily impact)', value: 5 },
  ],
  24: [ // Learning Style
    { label: 'Reading and written instructions', value: 'learning_visual_text' },
    { label: 'Visual diagrams and demonstrations', value: 'learning_visual_diagrams' },
    { label: 'Hands-on experimentation and doing', value: 'learning_kinesthetic' },
    { label: 'Verbal discussion and talking it through', value: 'learning_auditory' },
    { label: 'A combination of multiple approaches', value: 'learning_multimodal' },
  ],
  25: [ // Primary Obstacle
    { label: 'Not knowing where to start', value: 'obstacle_start' },
    { label: 'Getting distracted or losing focus', value: 'obstacle_focus' },
    { label: 'Feeling like it\'s not good enough', value: 'obstacle_perfectionism' },
    { label: 'Lack of time or energy', value: 'obstacle_capacity' },
    { label: 'Not caring enough about what I\'m working on', value: 'obstacle_motivation' },
  ],
};

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
        const profile = await scoreAssessment(coreResponses);
        
        // Store both core and calibration responses in profile
        const enrichedProfile = {
          ...profile,
          responses: coreResponses,
          calibrationResponses: calibrationResponses,
        };

        localStorage.setItem('pending_assessment', JSON.stringify(enrichedProfile));
        setArchetypeProfile(profile);
      }
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
        <main className="max-w-[600px] flex flex-col items-center gap-8">
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
        <div className="w-full flex justify-center md:justify-end">
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
