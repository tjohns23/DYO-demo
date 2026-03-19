'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DimensionalScores {
  perfectionism: number;
  avoidance: number;
  overthinking: number;
  scopeCreep: number;
}

export interface UserResponse {
  questionId: number;
  rating: number; // 1–5 Likert value
}

export type ArchetypeSlug =
  | 'perfectionist'
  | 'avoider'
  | 'overthinker'
  | 'scope_creeper';

export interface ArchetypeProfile {
  slug: ArchetypeSlug;
  /** Short display name shown in the hero headline */
  name: string;
  /** One-line honest label — the "supportive but firm" hook */
  tagline: string;
  /** 2–3 sentence description for the reveal card */
  description: string;
  /** Raw dimension totals from this assessment */
  scores: DimensionalScores;
}

// ---------------------------------------------------------------------------
// Question → Dimension mapping
// Mirrors the QUESTIONS array in AssessmentQuiz.tsx so scoring is source-of-truth
// here without importing a client component.
// ---------------------------------------------------------------------------

const QUESTION_DIMENSION_MAP: Record<number, keyof DimensionalScores> = {
  // Perfectionism (Q1–5)
  1: 'perfectionism',
  2: 'perfectionism',
  3: 'perfectionism',
  4: 'perfectionism',
  5: 'perfectionism',

  // Avoidance (Q6–10)
  6: 'avoidance',
  7: 'avoidance',
  8: 'avoidance',
  9: 'avoidance',
  10: 'avoidance',

  // Overthinking (Q11–15)
  11: 'overthinking',
  12: 'overthinking',
  13: 'overthinking',
  14: 'overthinking',
  15: 'overthinking',

  // Scope Creep (Q16–20)
  16: 'scopeCreep',
  17: 'scopeCreep',
  18: 'scopeCreep',
  19: 'scopeCreep',
  20: 'scopeCreep',
};

// ---------------------------------------------------------------------------
// Archetype metadata
// Tone: "Supportive but Firm" — honest about the pattern, warm about the person.
// Max score per dimension = 25 (5 questions × 5 points).
// ---------------------------------------------------------------------------

const ARCHETYPE_METADATA: Record<
  ArchetypeSlug,
  Pick<ArchetypeProfile, 'name' | 'tagline' | 'description'>
> = {
  perfectionist: {
    name: 'The Perfectionist',
    tagline: "You're wired for excellence — and it's keeping you stuck.",
    description:
      "You set the bar high and hold yourself to every inch of it. That drive produces beautiful work — eventually. But that same standard has a shadow side: it keeps finished work in draft forever. You don't need lower standards. You need a hard deadline that makes 'good enough to ship' feel like victory.",
  },
  avoider: {
    name: 'The Avoider',
    tagline: "You're not lazy. You're afraid — and that's fixable.",
    description:
      "You know what needs doing. You're talented enough to do it. But something between knowing and starting feels unbridgeable. That gap isn't a character flaw — it's a learned pattern, and patterns can be interrupted. A short, scoped mission is harder to avoid than an open-ended project.",
  },
  overthinker: {
    name: 'The Overthinker',
    tagline: 'Your brain is working overtime. Time to put it to work.',
    description:
      "You've mapped every angle, weighed every option, and considered every outcome — twice. You're not lacking information; you're drowning in it. More research won't break the loop. A timer and a single, locked-in direction will. The best decision is the one you actually execute.",
  },
  scope_creeper: {
    name: 'The Scope Creeper',
    tagline: 'Every good idea deserves a version 1.0.',
    description:
      "Your imagination is your superpower and your kryptonite. Every project expands with possibility — and expanded projects rarely ship. The answer isn't fewer ideas; it's a harder boundary around version one. Ship the core. The rest becomes version two.",
  },
};

// ---------------------------------------------------------------------------
// Core scoring functions (pure — no side effects)
// ---------------------------------------------------------------------------

/**
 * Aggregates raw Likert responses into per-dimension totals.
 * Unknown question IDs are silently ignored.
 */
function calculateDimensionalScores(
  responses: UserResponse[]
): DimensionalScores {
  const totals: DimensionalScores = {
    perfectionism: 0,
    avoidance: 0,
    overthinking: 0,
    scopeCreep: 0,
  };

  for (const { questionId, rating } of responses) {
    const dimension = QUESTION_DIMENSION_MAP[questionId];
    if (dimension !== undefined) {
      totals[dimension] += rating;
    }
  }

  return totals;
}

/**
 * Identifies the primary archetype from dimensional totals.
 * Tie-breaking priority: perfectionism > avoidance > overthinking > scope_creeper.
 * This ordering reflects which pattern most commonly surfaces first in the target user.
 */
function determineArchetype(scores: DimensionalScores): ArchetypeSlug {
  const ranked: [ArchetypeSlug, number][] = [
    ['perfectionist', scores.perfectionism],
    ['avoider', scores.avoidance],
    ['overthinker', scores.overthinking],
    ['scope_creeper', scores.scopeCreep],
  ];

  // Stable sort: higher score first; index position breaks ties (priority order above).
  ranked.sort((a, b) => b[1] - a[1]);

  return ranked[0][0];
}

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

/**
 * Scores a completed assessment and returns metadata for the UI "Tease".
 * * Flow:
 * 1. Aggregates raw 1-5 responses into DimensionalScores.
 * 2. Determines the primary ArchetypeSlug (highest dimension wins).
 * 3. Maps the slug to static ARCHETYPE_METADATA.
 * 4. Returns the result for the frontend to store in state/sessionStorage.
 * * Note: This function does NOT persist data to the database. 
 * Use `linkAssessmentToUser` after the user authenticates to save results.
 * * @param responses - Array of { questionId, rating } for the 20 assessment questions.
 */
export async function scoreAssessment(
  responses: UserResponse[],
): Promise<ArchetypeProfile> {
  // Calculate the raw dimensions
  const scores = calculateDimensionalScores(responses);

  // Determine the archetype slug from the scores
  const slug = determineArchetype(scores);

  // Fetch the metadata for this archetype (name, description, etc.)
  const metadata = ARCHETYPE_METADATA[slug];

  // Return the 'tease' data
  return {
    slug,
    name: metadata.name,
    tagline: metadata.tagline,
    description: metadata.description,
    scores,
  };
}

export async function linkAssessmentToUser(userId: string, email: string, profile: ArchetypeProfile) {
  try {
    // A. Resolve the archetype UUID from the slug
    const { data: archetypeRow, error: archetypeErr } = await supabaseAdmin
      .from('archetypes')
      .select('id')
      .eq('slug', profile.slug)
      .single();

    if (archetypeErr) throw new Error(`Archetype ${profile.slug} not found in DB.`);

    // B. Upsert to the profiles table
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        archetype_id: archetypeRow.id,
        perfectionism_score: profile.scores.perfectionism,
        avoidance_score: profile.scores.avoidance,
        overthinking_score: profile.scores.overthinking,
        scope_creep_score: profile.scores.scopeCreep,
        updated_at: new Date().toISOString(),
      });

    if (profileErr) throw profileErr;

    return { success: true };
  } catch (err) {
    console.error("Critical: Failed to sync assessment to profile", err);
    throw err; // Fail-loud!
  }
}