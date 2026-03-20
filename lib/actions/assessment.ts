'use server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArchetypeScores {
  optimizer:  number;
  strategist: number;
  visionary:  number;
  advocate:   number;
  politician: number;
  empath:     number;
  builder:    number;
  stabilizer: number;
}

export interface UserResponse {
  questionId: number;
  rating:     number; // 1–5 Likert value
}

export type ArchetypeSlug =
  | 'optimizer'
  | 'strategist'
  | 'visionary'
  | 'advocate'
  | 'politician'
  | 'empath'
  | 'builder'
  | 'stabilizer';

export interface CalibrationResponse {
  questionId: number;
  value: string | number;
}

export interface ArchetypeProfile {
  slug: ArchetypeSlug;
  /** Short display name shown in the hero headline */
  name: string;
  /** One-line honest label — the "supportive but firm" hook */
  tagline: string;
  /** 2–3 sentence description for the reveal card */
  description: string;
  /** Raw archetype totals from this assessment */
  scores: ArchetypeScores;
  /** Raw quiz responses (optional, persisted after auth) */
  responses?: UserResponse[];
  /** Calibration responses for mission generation logic */
  calibrationResponses?: CalibrationResponse[];
}

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

const QUESTION_ARCHETYPE_MAP: QuestionMap = {
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
// Tone: "Supportive but Firm" — honest about the pattern, warm about the person.
// Max score per dimension = 25 (5 questions × 5 points).
// ---------------------------------------------------------------------------

// Import from separate file (can't export constants from 'use server' files)
import { ARCHETYPE_METADATA } from '@/lib/archetype-metadata';

// ---------------------------------------------------------------------------
// Core scoring functions (pure — no side effects)
// ---------------------------------------------------------------------------

/**
 * Aggregates raw Likert responses into per-archetype totals.
 * Each response increments and/or decrements specific archetype scores.
 * Unknown question IDs are silently ignored.
 */
function calculateArchetypeScores(
  responses: UserResponse[]
): ArchetypeScores {
  const totals: ArchetypeScores = {
    optimizer: 0,
    strategist: 0,
    visionary: 0,
    advocate: 0,
    politician: 0,
    empath: 0,
    builder: 0,
    stabilizer: 0,
  };

  for (const { questionId, rating } of responses) {
    const mapping = QUESTION_ARCHETYPE_MAP[questionId];
    if (!mapping) continue; // Skip unknown questions

    // Add points to increment archetypes
    for (const archetype of mapping.increments) {
      totals[archetype] += rating;
    }

    // Subtract points from decrement archetypes
    for (const archetype of mapping.decrements) {
      totals[archetype] -= rating;
    }
  }

  return totals;
}

/**
 * Identifies the primary archetype from archetype totals.
 * The archetype with the highest score wins; ties default to the first in the array.
 */
function determineArchetype(scores: ArchetypeScores): ArchetypeSlug {
  const archetypes: ArchetypeSlug[] = [
    'optimizer',
    'strategist',
    'visionary',
    'advocate',
    'politician',
    'empath',
    'builder',
    'stabilizer',
  ];

  let maxScore = -Infinity;
  let winningSlug: ArchetypeSlug = 'optimizer';

  for (const archetype of archetypes) {
    if (scores[archetype] > maxScore) {
      maxScore = scores[archetype];
      winningSlug = archetype;
    }
  }

  return winningSlug;
}

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

/**
 * Scores a completed assessment and returns metadata for the UI "Tease".
 * Flow:
 * 1. Aggregates raw 1-5 responses into ArchetypeScores.
 * 2. Determines the primary ArchetypeSlug (highest score wins).
 * 3. Maps the slug to static ARCHETYPE_METADATA.
 * 4. Returns the result for the frontend to store in state/localStorage.
 *
 * Note: This function does NOT persist data to the database.
 * Use `saveAssessmentToProfile` after the user authenticates to save results.
 *
 * @param responses - Array of { questionId, rating } for the 20 assessment questions.
 */
export async function scoreAssessment(
  responses: UserResponse[],
): Promise<ArchetypeProfile> {
  // Calculate the raw archetype scores from responses
  const scores = calculateArchetypeScores(responses);

  // Determine the archetype slug from the scores
  const slug = determineArchetype(scores);

  // Fetch the metadata for this archetype (name, description, etc.)
  const metadata = ARCHETYPE_METADATA[slug];

  // Return the 'tease' data with responses for persistence
  return {
    slug,
    name: metadata.name,
    tagline: metadata.tagline,
    description: metadata.description,
    scores,
    responses,
  };
}