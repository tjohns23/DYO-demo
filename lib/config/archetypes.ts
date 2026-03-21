/**
 * Archetype Configuration
 *
 * Contains:
 * 1. QUESTION_ARCHETYPE_MAP - defines which archetypes each question affects
 * 2. ARCHETYPE_METADATA - descriptive content for each archetype
 */

import type { ArchetypeSlug, ArchetypeProfile } from '@/lib/actions/assessment';

// ---------------------------------------------------------------------------
// Core Assessment Questions & Options
// ---------------------------------------------------------------------------

export type CoreQuestion = {
  id: number;
  text: string;
};

export type CoreOption = { label: string; value: number };

export const CORE_OPTIONS: CoreOption[] = [
  { label: 'Strongly Disagree', value: 1 },
  { label: 'Disagree', value: 2 },
  { label: 'Neutral', value: 3 },
  { label: 'Agree', value: 4 },
  { label: 'Strongly Agree', value: 5 },
];

export const CORE_QUESTIONS: CoreQuestion[] = [
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

  // Expanded Differentiation Questions (Questions 21-33)
  // Politician energy/visibility
  { id: 21, text: 'I energize a room when I\'m excited about something, and that energy helps me execute.' },
  { id: 22, text: 'I\'m more likely to finish work if I\'ve publicly committed to it than if I keep it private.' },

  // Empath emotional sensitivity
  { id: 23, text: 'I can sense emotional undercurrents in conversations that others seem to miss, and this affects my work.' },
  { id: 24, text: 'When someone criticizes my work harshly, it takes me days to recover emotionally, not hours.' },

  // Builder systems & structure
  { id: 25, text: 'I get more satisfaction from building reliable, repeatable systems than from creative innovation.' },
  { id: 26, text: 'Give me clear requirements and a defined process, and I\'ll execute flawlessly—give me ambiguity and I\'ll struggle.' },

  // Stabilizer anxiety & change
  { id: 27, text: 'Rapid changes and shifting priorities create anxiety that genuinely affects my ability to work.' },
  { id: 28, text: 'I\'d rather follow a proven, reliable approach than experiment with something new, even if it might work better.' },

  // Optimizer perfectionism
  { id: 29, text: 'I notice small imperfections in my work that others would never see, and I can\'t ignore them.' },
  { id: 30, text: 'The gap between "what I made" and "what I envisioned" bothers me more than it seems to bother others.' },

  // Visionary ambiguity & focus
  { id: 31, text: 'I thrive in ambiguity and prefer to figure things out as I go, without a predetermined plan.' },
  { id: 32, text: 'Once I commit to a project, I never start something new until I\'ve completely finished it.' },
  { id: 33, text: 'I always finish everything I start, without exception, no matter how challenging or time-consuming.' },
];

// ---------------------------------------------------------------------------
// Calibration Questions & Options
// ---------------------------------------------------------------------------

export type CalibrationQuestion = {
  id: number;
  text: string;
  type: 'likert' | 'multiple-choice';
};

export type CalibrationOption = { label: string; value: string | number };
export type CalibrationOptions = Record<number, CalibrationOption[]>;

export const CALIBRATION_QUESTIONS: CalibrationQuestion[] = [
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

export const CALIBRATION_OPTIONS: CalibrationOptions = {
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

// ---------------------------------------------------------------------------
// Question → Archetype mapping
// Each question increments and/or decrements specific archetypes based on responses.
// A response of 5 (Strongly Agree) will add 5 points per increment archetype
// and subtract 5 points per decrement archetype.
// ---------------------------------------------------------------------------

type QuestionMap = Record<
  number,
  { increments: ArchetypeSlug[]; decrements: ArchetypeSlug[] }
>;

export const QUESTION_ARCHETYPE_MAP: QuestionMap = {
  1:  { increments: ['optimizer'],                decrements: ['builder'] },
  2:  { increments: ['optimizer', 'strategist'],  decrements: ['stabilizer'] },
  3:  { increments: ['strategist', 'builder'],    decrements: ['visionary'] },
  4:  { increments: ['strategist', 'stabilizer'], decrements: ['politician'] },
  5:  { increments: ['visionary', 'advocate'],    decrements: ['builder'] },
  6:  { increments: ['visionary'],                decrements: ['optimizer', 'stabilizer'] },
  7:  { increments: ['advocate', 'empath'],       decrements: ['builder'] },
  8:  { increments: ['advocate'],                 decrements: ['politician'] },
  9:  { increments: ['politician'],               decrements: ['strategist'] },
  10: { increments: ['politician'],               decrements: ['builder'] },
  11: { increments: ['empath', 'optimizer'],      decrements: ['politician'] },
  12: { increments: ['empath'],                   decrements: ['visionary'] },
  13: { increments: ['builder', 'stabilizer'],    decrements: ['visionary'] },
  14: { increments: ['builder', 'stabilizer'],    decrements: ['advocate'] },
  15: { increments: ['stabilizer', 'empath'],     decrements: ['visionary'] },
  16: { increments: ['stabilizer'],               decrements: ['politician'] },
  17: { increments: ['optimizer'],                decrements: ['stabilizer'] },
  18: { increments: ['visionary'],                decrements: ['builder'] },
  19: { increments: ['strategist', 'advocate'],   decrements: ['politician'] },
  20: { increments: ['advocate'],                 decrements: ['visionary'] },
};

// ---------------------------------------------------------------------------
// Archetype metadata
// ---------------------------------------------------------------------------

export const ARCHETYPE_METADATA: Record<
  ArchetypeSlug,
  Pick<ArchetypeProfile, 'name' | 'tagline' | 'description'>
> = {
  optimizer: {
    name: 'The Optimizer',
    tagline: 'I make things better - again and again.',
    description:
      'You have exceptional standards. While others ship "good enough," you see the gap between what exists and what could be. This isn\'t pickiness—it\'s genuine care for craft. You iterate because you can see the better version, and you can\'t unsee it.\n\nYour work, when it finally ships, is excellent. The problem isn\'t quality—it\'s knowing when excellent becomes the enemy of done. You refine the pitch deck one more time. You rewrite the email again. You tweak the design just a little more. Each iteration feels productive, but somewhere along the way, "making it better" became a way to avoid the vulnerability of calling it finished.\n\nYou don\'t ship bad work. You ship almost nothing, because almost nothing feels ready. The world needs your craft—but it needs you to stop polishing and press send.',
  },
  strategist: {
    name: 'The Strategist',
    tagline: 'I need the system to make sense before I move.',
    description:
      'You think in systems, not steps. Before you start, you need to see how the pieces connect—the architecture, the dependencies, the long-term implications. This is your superpower. While others build blindly, you design for coherence.\n\nBut here\'s where it gets tricky: understanding the full system can become a reason to never start building it. You research. You map. You analyze. You consider edge cases and second-order effects. All of this feels like progress—and intellectually, it is. But the plan is now so well-architected that actually executing it feels almost redundant.\n\nYou\'re not avoiding the work because it\'s hard. You\'re avoiding it because starting means accepting that you\'ll never have perfect information. The system will never be fully clear. And for you, that\'s harder than the work itself.',
  },
  visionary: {
    name: 'The Visionary',
    tagline: 'I see what could be before others do.',
    description:
      'You see possibilities others miss. While they execute on the obvious, you\'re three moves ahead, connecting dots that haven\'t been drawn yet. This is why people come to you for ideas. You generate momentum just by talking about what\'s possible.\n\nThe problem is you generate ideas faster than you close loops. You start the project, get excited about the next evolution, add features mid-build, and suddenly you\'re working on three different versions of the same thing. Or worse—you\'ve moved on to an entirely new idea because this one started feeling too defined, too constrained, too… done.\n\nYou don\'t lack follow-through because you\'re lazy. You lack it because finishing feels like killing the possibility of what it could still become. But the world doesn\'t need your best idea. It needs your finished idea.',
  },
  advocate: {
    name: 'The Advocate',
    tagline: 'I need my work to mean something.',
    description:
      'You don\'t just want to build things—you want to build things that matter. Your work has to connect to something larger: a mission, a community, a set of values you actually believe in. When it does, you\'ll work harder than anyone. When it doesn\'t, you can barely start.\n\nThis isn\'t entitlement. It\'s integrity. You physically can\'t bring yourself to execute on something that feels misaligned, extractive, or meaningless. Other people can compartmentalize. You can\'t. If the work doesn\'t serve something you care about, your body just… stops.\n\nThe challenge is that meaning isn\'t always clear upfront. Sometimes you have to ship version one to discover what version two should serve. But you stall in the uncertainty, waiting for the purpose to reveal itself—when the purpose might only become clear through the act of finishing.',
  },
  politician: {
    name: 'The Politician',
    tagline: 'I move things forward through people.',
    description:
      'You build through relationships. While others work in isolation, you energize through collaboration, feedback, and visibility. You\'re not performing—you\'re genuinely fueled by connection. Ideas become real when you talk them through. Execution feels possible when others are watching.\n\nThe flip side: when you\'re working alone, your momentum dies. The project that felt exciting in the team meeting becomes a slog at your desk. You tell yourself you\'ll get to it, but without an audience, without feedback, without someone to build with, the work just… sits there.\n\nYou\'re not dependent on validation—you\'re dependent on energy exchange. And in a world that romanticizes the solo grind, that can feel like a weakness. It\'s not. You just need to design your execution around how you\'re actually wired: ship with witnesses, build in public, make solo work social.',
  },
  empath: {
    name: 'The Empath',
    tagline: 'My work is deeply tied to how safe I feel.',
    description:
      'You feel things others miss. You sense the emotional undercurrents in a room, the unspoken tension in a message, the weight of how your work might land. This makes you an incredible creator—your work has depth because you care deeply about how it affects people.\n\nBut that same sensitivity can become your prison. Shipping work means exposing it to judgment, and exposure feels like being unprotected. You can handle the work itself—it\'s the vulnerability of being seen that freezes you. So you delay. You soften. You hide behind "not ready yet" because not ready feels safer than not good enough.\n\nYou don\'t lack courage. You lack permission to ship something that might not land perfectly. But here\'s the truth: the people you\'re creating for would rather have your imperfect work than your protected silence.',
  },
  builder: {
    name: 'The Builder',
    tagline: 'I turn ideas into reliable systems.',
    description:
      'You\'re an execution machine—when the system is clear. Give you defined inputs, success criteria, and a process to follow, and you\'ll build it flawlessly. You don\'t need motivation; you need structure. Once you have it, you\'re unstoppable.\n\nThe problem is what happens when the structure isn\'t there. When the project is ambiguous, the inputs are messy, or the definition of "done" keeps shifting, you freeze. Not because you can\'t handle the work—but because you can\'t execute without knowing what "good" looks like.\n\nOther people can start messy and figure it out as they go. You need the rails before you can run. And in early-stage work, creative work, self-directed work—the rails don\'t exist yet. That\'s not a flaw in you. That\'s a mismatch between your wiring and the ask. You don\'t need to learn to be comfortable with ambiguity. You need to build the minimum structure required to start.',
  },
  stabilizer: {
    name: 'The Stabilizer',
    tagline: 'I execute best when I know what\'s expected.',
    description:
      'You\'re dependable. When the expectations are clear, you deliver—consistently, reliably, without drama. You don\'t need glory; you need clarity. Tell you what success looks like, and you\'ll get there.\n\nBut when things are unclear—when priorities shift, when the goalposts move, when you\'re expected to self-direct without guidance—you freeze. Not because you\'re incapable, but because ambiguity feels like walking into a test you didn\'t study for. You\'re not afraid of the work. You\'re afraid of doing it wrong.\n\nOther people seem comfortable just starting and figuring it out. For you, that feels reckless. So you wait for clarity that might never come. You hesitate. You check in too many times. You stall—not out of laziness, but out of a deep need to do it right.\n\nYou don\'t need to become comfortable with chaos. You need missions so clear that "right" is obvious.',
  },
};
