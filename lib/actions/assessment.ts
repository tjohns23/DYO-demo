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
  /** One-line honest label */
  tagline: string;
  /** 2–3 sentence description for the reveal card */
  description: string;
  /** Raw archetype totals from this assessment */
  scores: ArchetypeScores;
  /** Dimensional scores used as input to archetype scoring */
  dimensions?: DimensionalScores;
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

export interface DimensionalScores {
  perfectionism:        number;
  systemsThinking:      number;
  visionSeeking:        number;
  purposeOrientation:   number;
  socialEnergy:         number;
  emotionalSensitivity: number;
  structurePreference:  number;
  stabilityNeed:        number;
}

export interface ConsistencyIssue {
  type:               'ambiguity_contradiction' | 'completion_contradiction' | 'aspirational_answering';
  severity:           'low' | 'medium';
  message:            string;
  affectedQuestions:  number[];
}

export interface ConsistencyCheck {
  /** False when 2 or more contradictions are detected */
  reliable:             boolean;
  issues:               ConsistencyIssue[];
  /**
   * Multiplied into scores as (1 + confidenceAdjustment).
   * Decreases by 0.1 per detected issue (e.g. 2 issues → ×0.8).
   */
  confidenceAdjustment: number;
}

// ---------------------------------------------------------------------------
// Archetype configuration
// ---------------------------------------------------------------------------

import { ARCHETYPE_METADATA } from '@/lib/config/archetypes';

// ---------------------------------------------------------------------------
// Core scoring functions (pure — no side effects)
// ---------------------------------------------------------------------------

/**
 * Converts a UserResponse array into a lookup map keyed by question ID.
 * Calculates the average of the provided ratings.
 */
function calculateDimensions(responses: UserResponse[]): DimensionalScores {
  const r: Record<number, number> = {};
  for (const { questionId, rating } of responses) {
    r[questionId] = rating;
  }

  const avg = (...ids: number[]) =>
    ids.reduce((sum, id) => sum + (r[id] ?? 0), 0) / ids.length;

  return {
    perfectionism:        avg(1, 2, 17, 29, 30),
    systemsThinking:      avg(3, 4, 19, 30),
    visionSeeking:        avg(5, 6, 18, 30),
    purposeOrientation:   avg(7, 8, 20, 23),
    socialEnergy:         avg(9, 10, 21, 22),
    emotionalSensitivity: avg(11, 12, 23, 24),
    structurePreference:  avg(13, 14, 25, 26),
    stabilityNeed:        avg(15, 16, 27, 28),
  };
}

/**
 * Checks for semantic contradictions in the response set using three targeted tests.
 * Q31–33 are consistency-only questions that don't feed into dimensional scoring.
 * Some questions (Q3, Q6, Q13–16, Q18) appear in both dimensions and checks —
 * the consistency logic cross-references those answers against the dedicated
 * consistency questions to detect implausible combinations.
 *
 * Reliability drops to false at 2+ issues; confidence is reduced by 10% per issue.
 */
function checkConsistency(responses: UserResponse[]): ConsistencyCheck {
  const r: Record<number, number> = {};
  for (const { questionId, rating } of responses) {
    r[questionId] = rating;
  }

  const avg = (...ids: number[]) =>
    ids.reduce((sum, id) => sum + (r[id] ?? 0), 0) / ids.length;

  const issues: ConsistencyIssue[] = [];

  // CHECK 1: Ambiguity Tolerance
  // High structure need + high ambiguity comfort is a contradiction
  const structureScore   = avg(3, 13, 14, 15, 16);
  const ambiguityComfort = r[31] ?? 0;
  if (structureScore > 3.5 && ambiguityComfort > 3.5) {
    issues.push({
      type:              'ambiguity_contradiction',
      severity:          'medium',
      message:           'You indicated both needing structure and thriving in ambiguity',
      affectedQuestions: [3, 13, 14, 15, 16, 31],
    });
  }

  // CHECK 2: Completion Pattern
  // High multi-start tendency + always-finishes-first is a contradiction
  const multiStartScore = avg(6, 18);
  const finishFirst     = r[32] ?? 0;
  if (multiStartScore > 3.5 && finishFirst > 3.5) {
    issues.push({
      type:              'completion_contradiction',
      severity:          'medium',
      message:           'You indicated both starting many projects and always finishing first',
      affectedQuestions: [6, 18, 32],
    });
  }

  // CHECK 3: Extreme Claim Detection
  // A perfect 5 on Q33 suggests aspirational rather than honest answering
  if ((r[33] ?? 0) === 5) {
    issues.push({
      type:              'aspirational_answering',
      severity:          'low',
      message:           'Extreme claim detected - may be answering aspirationally',
      affectedQuestions: [33],
    });
  }

  return {
    reliable:             issues.length < 2,
    issues,
    confidenceAdjustment: issues.length * -0.1,
  };
}

/**
 * Calculates per-archetype scores from pre-computed dimensional scores.
 * Each archetype is a weighted combination of the dimensions most associated
 * with it; negative weights on dimensions that actively oppose the archetype
 * help separate close archetypes from one another.
 *
 * If the consistency check flags the responses as unreliable, all scores are
 * dampened by 15% to reflect reduced confidence.
 */
function calculateArchetypeScores(
  dimensions: DimensionalScores,
  consistencyCheck: ConsistencyCheck,
): ArchetypeScores {
  const scores: ArchetypeScores = {
    optimizer:  (dimensions.perfectionism        * 2.0) + (dimensions.emotionalSensitivity * 0.5) + (dimensions.structurePreference  *  0.3),
    strategist: (dimensions.systemsThinking      * 2.0) + (dimensions.visionSeeking        * 0.5) + (dimensions.socialEnergy         * -0.3),
    visionary:  (dimensions.visionSeeking        * 2.0) + (dimensions.purposeOrientation   * 0.5) + (dimensions.structurePreference  * -0.5),
    advocate:   (dimensions.purposeOrientation   * 2.0) + (dimensions.emotionalSensitivity * 0.5) + (dimensions.socialEnergy         *  0.3),
    politician: (dimensions.socialEnergy         * 2.0) + (dimensions.visionSeeking        * 0.3) + (dimensions.stabilityNeed        * -0.5),
    empath:     (dimensions.emotionalSensitivity * 2.0) + (dimensions.stabilityNeed        * 0.5) + (dimensions.socialEnergy         * -0.3),
    builder:    (dimensions.structurePreference  * 2.0) + (dimensions.systemsThinking      * 0.5) + (dimensions.visionSeeking        * -0.5),
    stabilizer: (dimensions.stabilityNeed        * 2.0) + (dimensions.emotionalSensitivity * 0.3) + (dimensions.socialEnergy         * -0.5),
  };

  if (!consistencyCheck.reliable) {
    const factor = 1 + consistencyCheck.confidenceAdjustment;
    for (const key of Object.keys(scores) as (keyof ArchetypeScores)[]) {
      scores[key] *= factor;
    }
  }

  return scores;
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

export interface AssessmentResult {
  profiles: ArchetypeProfile[];
  consistencyCheck: ConsistencyCheck;
}

/**
 * Scores a completed assessment and returns the top 3 archetype profiles ranked by score.
 * Flow:
 * 1. Aggregates raw 1-5 responses into ArchetypeScores.
 * 2. Determines the top 3 ArchetypeSlugs (by score).
 * 3. Maps each slug to static ARCHETYPE_METADATA.
 * 4. Returns profiles and the consistency check for the caller to act on.
 *
 * Note: This function does NOT persist data to the database.
 * Use `saveAssessmentToProfile` after the user authenticates to save results.
 *
 * @param responses - Array of { questionId, rating } for the 20 assessment questions.
 * @returns Profiles (top 3) and the raw ConsistencyCheck result.
 */
export async function scoreAssessment(
  responses: UserResponse[],
): Promise<AssessmentResult> {
  // Calculate dimensional scores (used as input to archetype scoring)
  const dimensions = calculateDimensions(responses);

  // Check whether the response pattern is reliable before scoring
  const consistencyCheck = checkConsistency(responses);

  // Derive archetype scores from dimensions
  const scores = calculateArchetypeScores(dimensions, consistencyCheck);

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
    dimensions,
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

  return { profiles, consistencyCheck };
}