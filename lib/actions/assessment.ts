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
  /** Secondary archetype (if present) */
  secondary?: { slug: ArchetypeSlug; name: string; tagline: string };
  /** Tertiary archetype (if present, stored for analytics only) */
  tertiary?: { slug: ArchetypeSlug; name: string; tagline: string };
}

interface ArchetypeRanking {
  primary: ArchetypeSlug;
  secondary: ArchetypeSlug | null;
  tertiary: ArchetypeSlug | null;
}

// ---------------------------------------------------------------------------
// Archetype configuration
// ---------------------------------------------------------------------------

import { QUESTION_ARCHETYPE_MAP, ARCHETYPE_METADATA } from '@/lib/config/archetypes';

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
    if (!mapping) {
      console.warn(`No archetype mapping for question ID ${questionId}`);
      continue;
    }; // Skip unknown questions

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
 * Identifies the primary, secondary and tertiary archetypes from archetype totals.
 * The archetype with the highest score wins; ties default to the first in the array.
 */
function determineArchetype(scores: ArchetypeScores): ArchetypeRanking {
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

  let secondaryArchetype: ArchetypeSlug | null = null;
  let tertiaryArchetype: ArchetypeSlug | null = null;

  // Sort archetypes by score in descending order
  const sortedArchetypes = archetypes.sort((a, b) => scores[b] - scores[a]);

  // Primary archetype is the highest scorer
  const primaryArchetype = sortedArchetypes[0]; 
  const primaryScore = scores[primaryArchetype];

  // Check for close scores to identify secondary and tertiary archetypes
  const secondScore = scores[sortedArchetypes[1]];
  const thirdScore = scores[sortedArchetypes[2]];
  
  if (primaryScore - secondScore <= 1) secondaryArchetype = sortedArchetypes[1]; // If second place is within 1 point, it's a secondary archetype
  if (primaryScore - thirdScore <= 1.5) tertiaryArchetype = sortedArchetypes[2]; // If third place is also close, it's a tertiary archetype

  return {
    primary: primaryArchetype,
    secondary: secondaryArchetype,
    tertiary: tertiaryArchetype
  };
}

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

/**
 * Scores a completed assessment and returns the top 3 archetype profiles ranked by score.
 * Flow:
 * 1. Aggregates raw 1-5 responses into ArchetypeScores.
 * 2. Determines the top 3 ArchetypeSlugs (by score).
 * 3. Maps each slug to static ARCHETYPE_METADATA.
 * 4. Returns an array of ArchetypeProfile objects for display/persistence.
 *
 * Note: This function does NOT persist data to the database.
 * Use `saveAssessmentToProfile` after the user authenticates to save results.
 *
 * @param responses - Array of { questionId, rating } for the 20 assessment questions.
 * @returns Array of top 3 ArchetypeProfile objects (filtered to exclude null secondary/tertiary if too far behind).
 */
export async function scoreAssessment(
  responses: UserResponse[],
): Promise<ArchetypeProfile[]> {
  // Calculate the raw archetype scores from responses
  const scores = calculateArchetypeScores(responses);

  // Determine the top 3 ranked archetypes
  const ranking = determineArchetype(scores);

  // Build array of profiles for the top 3
  const profiles: ArchetypeProfile[] = [];

  // Add primary archetype (always included)
  const primaryMetadata = ARCHETYPE_METADATA[ranking.primary];
  profiles.push({
    slug: ranking.primary,
    name: primaryMetadata.name,
    tagline: primaryMetadata.tagline,
    description: primaryMetadata.description,
    scores,
    responses,
  });

  // Add secondary if it exists (not null)
  if (ranking.secondary) {
    const secondaryMetadata = ARCHETYPE_METADATA[ranking.secondary];
    profiles.push({
      slug: ranking.secondary,
      name: secondaryMetadata.name,
      tagline: secondaryMetadata.tagline,
      description: secondaryMetadata.description,
      scores,
      responses,
    });
  }

  // Add tertiary if it exists (not null)
  if (ranking.tertiary) {
    const tertiaryMetadata = ARCHETYPE_METADATA[ranking.tertiary];
    profiles.push({
      slug: ranking.tertiary,
      name: tertiaryMetadata.name,
      tagline: tertiaryMetadata.tagline,
      description: tertiaryMetadata.description,
      scores,
      responses,
    });
  }

  return profiles;
}