/**
 * Mission Engine
 * Orchestrates the complete mission generation pipeline:
 * 1. Detect mode from work description
 * 2. Detect work type
 * 3. Detect pattern
 * 4. Select matching constraint
 * 5. Retrieve library examples
 * 6. Generate personalized framing with Gemini
 * 7. Validate output
 * 8. Assemble final mission
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import type { ArchetypeSlug } from '@/lib/actions/assessment';
import { detectMode, type Mode } from './modeDetector';
import { detectWorkType, type WorkType } from './workTypeDetector';
import { detectPattern, type Pattern, PATTERN_LIBRARY } from './patternDetector';

// All real pattern names (excludes the generic fallback) — passed to Gemini for classification
const PATTERN_NAMES = PATTERN_LIBRARY
  .filter(p => p.id !== 'generic_stall')
  .map(p => p.name);

// Import library data
import constraintsData from './mission-library/constraints.json';
import archetypeFramingsData from './mission-library/archetype-framings.json';
import workTypeScopesData from './mission-library/work_type_scopes.json';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type MissionStatus = 'pending' | 'accepted' | 'completed' | 'failed';

/**
 * User profile containing all information needed for mission generation
 */
export interface UserProfile {
  userId: string;
  primaryArchetype: ArchetypeSlug;
  workDescription: string;
  // Mode and WorkType will be auto-detected from workDescription
}


/**
 * Constraint object from constraints.json with mode-aware data
 */
export interface Constraint {
  constraintId: string;
  constraintName: string;
  category: string;
  defaultTimebox: number;
  relevantPatterns: string[];
  mode: Mode;
}

/**
 * Library examples combined from multiple sources
 */
export interface LibraryExamples {
  framing: string;
  scope: string;
  completion: string;
  constraintRule: string;
  // Whether each field came from an exact library match or a fallback
  framingExact: boolean;
  scopeExact: boolean;
}

/**
 * Example set for Gemini context showing different archetypes/work types
 */
export interface ExampleSet {
  workType: WorkType;
  scope: string;
  completion: string;
  framing?: string;
}

/**
 * Generated content from Gemini
 */
export interface GeneratedContent {
  patternName: string;
  constraintName: string;
  framing: string;
  scope: string;
  completion: string;
  timebox: number;
}

/**
 * Final mission object
 */
export interface Mission {
  // Metadata
  missionId: string;
  userId: string;
  createdAt: Date;
  status: MissionStatus;
  
  // Display components
  mode: Mode;
  pattern: string;
  patternDetected: boolean; // false when no stall keywords matched (generic fallback)
  
  // Content (mix of AI + library)
  framing: string;
  scope: string;
  constraintRule: string;
  completion: string;
  
  // Parameters
  timebox: number;
  
  // Tracking
  generatedBy: 'gemini' | 'claude' | 'library';
  constraintId: string;
  archetype: ArchetypeSlug;
  workType: WorkType;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generates a unique mission ID
 */
function generateMissionId(): string {
  return crypto.randomUUID();
}

// ============================================================================
// STEP 1: CONSTRAINT SELECTION
// ============================================================================

/**
 * Selects a random constraint matching the pattern and mode
 */
export function selectConstraint(
  mode: Mode,
  pattern: Pattern
): Constraint {
  const constraints = constraintsData as Record<string, Record<string, {
    constraintName: string;
    category: string;
    defaultTimebox: number;
    relevantPatterns: string[];
  }>>;

  // Fall back through modes if the detected mode has no constraints at all
  const modeConstraints = constraints[mode] ?? constraints['CREATE'] ?? Object.values(constraints)[0];

  if (!modeConstraints) {
    throw new Error('No constraints found in library');
  }

  // Filter constraints that include this pattern
  const matchingConstraintIds = Object.keys(modeConstraints).filter(constraintId => {
    const constraint = modeConstraints[constraintId];
    return constraint.relevantPatterns.includes(pattern.id);
  });

  // Fall back to any random constraint in the mode if none match the specific pattern
  const candidateIds = matchingConstraintIds.length > 0
    ? matchingConstraintIds
    : Object.keys(modeConstraints);

  if (candidateIds.length === 0) {
    throw new Error('No constraints found in library');
  }

  // Pick randomly from candidates
  const selectedId =
    candidateIds[Math.floor(Math.random() * candidateIds.length)];
  
  const constraintData = modeConstraints[selectedId];

  return {
    constraintId: selectedId,
    constraintName: constraintData.constraintName,
    category: constraintData.category,
    defaultTimebox: constraintData.defaultTimebox,
    relevantPatterns: constraintData.relevantPatterns,
    mode,
  };
}

// ============================================================================
// STEP 2: LIBRARY DATA RETRIEVAL
// ============================================================================

/**
 * Gets representative examples from library for given constraint
 * Returns 2-3 different work types to show pattern variety for Gemini
 */
export function getRepresentativeExamples(constraintId: string): ExampleSet[] {
  const workTypeScopesTyped = workTypeScopesData as Record<string, Record<string, {
    scope: string;
    completion: string;
  }>>;
  const archetypeFramings = archetypeFramingsData as Record<string, Record<string, string>>;

  const workTypeScopesForConstraint = workTypeScopesTyped[constraintId];

  if (!workTypeScopesForConstraint) {
    return [];
  }

  const availableWorkTypes = Object.keys(workTypeScopesForConstraint) as WorkType[];

  // Return diverse examples (max 3, covering different work types)
  const selectedTypes = availableWorkTypes.slice(0, 3);

  // Pick a sample framing from any available archetype for style reference
  const framingsByArchetype = archetypeFramings[constraintId];
  const sampleFraming = framingsByArchetype
    ? Object.values(framingsByArchetype)[0]
    : undefined;

  return selectedTypes.map((workType, i) => ({
    workType,
    scope: workTypeScopesForConstraint[workType].scope,
    completion: workTypeScopesForConstraint[workType].completion,
    // Only attach a framing sample to the first example to avoid repetition
    framing: i === 0 ? sampleFraming : undefined,
  }));
}

/**
 * Retrieves library examples from JSON files
 * Falls back gracefully for missing work types by using first available
 */
export function getLibraryExamples(
  constraintId: string,
  archetype: ArchetypeSlug,
  workType: WorkType
): LibraryExamples {
  // Get framing from archetype-framings.json
  const archetypeFramings = archetypeFramingsData as Record<string, Record<string, string>>;
  const archetypeFramingsByConstraint = archetypeFramings[constraintId];
  
  const framingExact = !!archetypeFramingsByConstraint?.[archetype];
  const framing = framingExact
    ? archetypeFramingsByConstraint![archetype]
    : 'Your work pattern has been identified. This mission will help you break through.';

  // Get scope and completion from work_type_scopes.json
  const workTypeScopesTyped = workTypeScopesData as Record<string, Record<string, {
    scope: string;
    completion: string;
  }>>;

  const workTypeScopesForConstraint = workTypeScopesTyped[constraintId];

  if (!workTypeScopesForConstraint) {
    return {
      framing,
      scope: `Complete the mission by focusing on your ${workType} work`,
      completion: 'Mission completed following the constraint guidelines',
      constraintRule: constraintId.replace(/_/g, ' '),
      framingExact,
      scopeExact: false,
    };
  }

  // "general" has no library entries — treat it as no match so Gemini generates from scratch
  const exactScopeData = workType !== 'general' ? workTypeScopesForConstraint[workType] : undefined;

  if (!exactScopeData) {
    return {
      framing,
      scope: `Complete the mission by focusing on your ${workType} work`,
      completion: 'Mission completed following the constraint guidelines',
      constraintRule: constraintId.replace(/_/g, ' '),
      framingExact,
      scopeExact: false,
    };
  }

  // Get constraint rule from constraints.json (for display)
  const constraints = constraintsData as Record<string, Record<string, {
    constraintName: string;
  }>>;

  let constraintRule = '';

  // Search through all modes to find the constraint
  for (const mode of Object.keys(constraints)) {
    if (constraints[mode] && constraints[mode][constraintId]) {
      constraintRule = constraints[mode][constraintId].constraintName;
      break;
    }
  }

  return {
    framing,
    scope: exactScopeData.scope,
    completion: exactScopeData.completion,
    constraintRule,
    framingExact,
    scopeExact: !!exactScopeData,
  };
}

// ============================================================================
// STEP 3: GEMINI GENERATION
// ============================================================================

/**
 * Wraps a promise with a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out')), timeoutMs)
    ),
  ]);
}

/**
 * Generates mission content with Gemini using library examples as context
 */
export async function generateMissionWithGemini(
  constraint: Constraint,
  userProfile: UserProfile,
  pattern: Pattern,
  workType: WorkType
): Promise<GeneratedContent> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('[Gemini] GOOGLE_GENERATIVE_AI_API_KEY is not configured');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: modelName });

    // Get representative examples to show Gemini format/length only
    const examples = getRepresentativeExamples(constraint.constraintId);

    const formatHint = examples.length > 0
      ? `FORMAT REFERENCE (style and tone only — do not copy this content, generate from the user's description):
${examples.map((ex, i) => {
  const lines = [
    `Example ${i + 1} (${ex.workType}):`,
    `  constraintName: "${ex.workType === examples[0].workType ? 'e.g. "Blitzkrieg Sprint" or "Worst Idea First" — a short punchy name for the constraint applied' : ''}"`,
    `  framing: "${ex.framing ?? '2-3 sentences explaining why this constraint helps this archetype break their pattern'}"`,
    `  scope: "${ex.scope}"`,
    `  completion: "${ex.completion}"`,
  ];
  return lines.join('\n');
}).join('\n\n')}`
      : `FORMAT REFERENCE: constraintName is a short punchy name (2-4 words), framing is 2-3 sentences, scope is 1-2 sentences, completion is 1 concise sentence.`;

    const prompt = `You are a mission-generation AI for DYO, a productivity app designed for creative people who stall. DYO identifies the specific pattern keeping a user stuck — whether that's analysis paralysis, scope creep, perfectionism, or fear of shipping — and assigns them a time-locked mission with a concrete constraint to break through it. The goal is to move people out of their heads and get their work from ideation through creation and into execution.

PRIMARY SOURCE — base all output on this:
"${userProfile.workDescription}"

USER CONTEXT:
- Archetype: ${userProfile.primaryArchetype}
- Detected Stall Pattern: ${pattern.name}
- Work Type: ${workType}

CONSTRAINT INSPIRATION (do not copy this name — use it as a creative direction to invent your own):
- Category: ${constraint.category}
- Example name from library: "${constraint.constraintName}" (rename this to something specific to the user's work)
- Suggested timebox range: around ${constraint.defaultTimebox} minutes, adjusted to fit the actual work

STALL PATTERN OPTIONS — only assign one if the description clearly indicates that specific stall (do not use "Work in Progress"):
${PATTERN_NAMES.map(name => `- ${name}`).join('\n')}

${formatHint}

TASK: Generate a mission grounded in the user's specific work description above.

Rules:
- The scope and completion must reference what the user actually described — no generic placeholders
- Do not reuse or paraphrase template language; derive everything from their description
- The framing explains why this constraint breaks their specific stall pattern (omit framing if no pattern is assigned)
- Timebox should fit the actual work described, not just the default
- Only assign a patternName if the description contains clear evidence of that stall — vague or simple descriptions (e.g. "I need to finish X") should return null

Return a JSON object with exactly these fields:
{
  "patternName": "A pattern from the list above, or null if the description is too generic to clearly identify one",
  "constraintName": "Short, punchy name for the constraint you're applying (2-4 words, e.g. 'Blitzkrieg Sprint', 'Worst Idea First')",
  "framing": "2-3 sentences: why this constraint helps a ${userProfile.primaryArchetype} stuck in their pattern",
  "scope": "Specific, actionable task derived from the user's description (1-2 sentences)",
  "completion": "Clear, concrete done-state for their specific work (1 sentence)",
  "timebox": "Number of minutes that fits the user's work and helps them break their pattern (not just the default)"
}

Return ONLY valid JSON, no markdown or extra text.`;

    const responsePromise = model.generateContent(prompt);
    const response = await withTimeout(responsePromise, 30000); // 30 second timeout
    const text = response.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('[Gemini] Response did not contain valid JSON');
    }

    const result = JSON.parse(jsonMatch[0]) as {
      patternName?: string | null;
      constraintName?: string;
      scope?: string;
      completion?: string;
      framing?: string;
      timebox?: number;
    };

    // patternName may be null — that's valid. Other fields are required.
    if (!result.constraintName || !result.scope || !result.completion || !result.timebox) {
      throw new Error('[Gemini] Response missing required fields');
    }

    const geminiDetectedPattern = !!result.patternName;

    return {
      patternName: result.patternName ?? '',
      constraintName: result.constraintName,
      scope: result.scope,
      completion: result.completion,
      // Only include framing if a pattern was identified
      framing: geminiDetectedPattern ? (result.framing ?? '') : '',
      timebox: result.timebox,
    };
}

/**
 * Generates mission content with Claude using library examples as context
 */
export async function generateMissionWithClaude(
  constraint: Constraint,
  userProfile: UserProfile,
  pattern: Pattern,
  workType: WorkType
): Promise<GeneratedContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('[Claude] ANTHROPIC_API_KEY is not configured');
  }

  const modelName = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

    const client = new Anthropic({ apiKey });

    // Get representative examples to show Claude format/length only
    const examples = getRepresentativeExamples(constraint.constraintId);

    const formatHint = examples.length > 0
      ? `FORMAT REFERENCE (style and tone only — do not copy this content, generate from the user's description):
${examples.map((ex, i) => {
  const lines = [
    `Example ${i + 1} (${ex.workType}):`,
    `  constraintName: "${ex.workType === examples[0].workType ? 'e.g. "Blitzkrieg Sprint" or "Worst Idea First" — a short punchy name for the constraint applied' : ''}"`,
    `  framing: "${ex.framing ?? '2-3 sentences explaining why this constraint helps this archetype break their pattern'}"`,
    `  scope: "${ex.scope}"`,
    `  completion: "${ex.completion}"`,
  ];
  return lines.join('\n');
}).join('\n\n')}`
      : `FORMAT REFERENCE: constraintName is a short punchy name (2-4 words), framing is 2-3 sentences, scope is 1-2 sentences, completion is 1 concise sentence.`;

    const prompt = `You are a mission-generation AI for DYO, a productivity app designed for creative people who stall. DYO identifies the specific pattern keeping a user stuck — whether that's analysis paralysis, scope creep, perfectionism, or fear of shipping — and assigns them a time-locked mission with a concrete constraint to break through it. The goal is to move people out of their heads and get their work from ideation through creation and into execution.

PRIMARY SOURCE — base all output on this:
"${userProfile.workDescription}"

USER CONTEXT:
- Archetype: ${userProfile.primaryArchetype}
- Detected Stall Pattern: ${pattern.name}
- Work Type: ${workType}

CONSTRAINT INSPIRATION (do not copy this name — use it as a creative direction to invent your own):
- Category: ${constraint.category}
- Example name from library: "${constraint.constraintName}" (rename this to something specific to the user's work)
- Suggested timebox range: around ${constraint.defaultTimebox} minutes, adjusted to fit the actual work

STALL PATTERN OPTIONS — only assign one if the description clearly indicates that specific stall (do not use "Work in Progress"):
${PATTERN_NAMES.map(name => `- ${name}`).join('\n')}

${formatHint}

TASK: Generate a mission grounded in the user's specific work description above.

Rules:
- The scope and completion must reference what the user actually described — no generic placeholders
- Do not reuse or paraphrase template language; derive everything from their description
- The framing explains why this constraint breaks their specific stall pattern (omit framing if no pattern is assigned)
- Timebox should fit the actual work described, not just the default
- Only assign a patternName if the description contains clear evidence of that stall — vague or simple descriptions (e.g. "I need to finish X") should return null

Return a JSON object with exactly these fields:
{
  "patternName": "A pattern from the list above, or null if the description is too generic to clearly identify one",
  "constraintName": "Short, punchy name for the constraint you're applying (2-4 words, e.g. 'Blitzkrieg Sprint', 'Worst Idea First')",
  "framing": "2-3 sentences: why this constraint helps a ${userProfile.primaryArchetype} stuck in their pattern",
  "scope": "Specific, actionable task derived from the user's description (1-2 sentences)",
  "completion": "Clear, concrete done-state for their specific work (1 sentence)",
  "timebox": "Number of minutes that fits the user's work and helps them break their pattern (not just the default)"
}

Return ONLY valid JSON, no markdown or extra text.`;

    const message = await withTimeout(
      client.messages.create({
        model: modelName,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
      30000
    ); // 30 second timeout

    const responseContent = message.content[0];
    if (!responseContent || responseContent.type !== 'text') {
      throw new Error('[Claude] Unexpected response format');
    }

    const text = responseContent.text;

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('[Claude] Response did not contain valid JSON');
    }

    const result = JSON.parse(jsonMatch[0]) as {
      patternName?: string | null;
      constraintName?: string;
      scope?: string;
      completion?: string;
      framing?: string;
      timebox?: number;
    };

    // patternName may be null — that's valid. Other fields are required.
    if (!result.constraintName || !result.scope || !result.completion || !result.timebox) {
      throw new Error('[Claude] Response missing required fields');
    }

    const claudeDetectedPattern = !!result.patternName;

    return {
      patternName: result.patternName ?? '',
      constraintName: result.constraintName,
      scope: result.scope,
      completion: result.completion,
      // Only include framing if a pattern was identified
      framing: claudeDetectedPattern ? (result.framing ?? '') : '',
      timebox: result.timebox,
    };
}

/**
 * Creates a generic fallback mission when Gemini is unavailable
 */
function createGenericFallback(
  constraint: Constraint,
  libraryExamples: LibraryExamples,
  workType: WorkType,
  patternName: string
): GeneratedContent {
  return {
    patternName,
    constraintName: constraint.constraintName,
    scope: libraryExamples.scope || `Complete your ${workType} work using the ${constraint.constraintName} constraint`,
    completion: libraryExamples.completion || 'Mission completed when the constraint is satisfied',
    framing: libraryExamples.framing || `This mission applies the ${constraint.constraintName} constraint to help you move forward.`,
    timebox: constraint.defaultTimebox,
  };
}

// ============================================================================
// STEP 4: VALIDATION
// ============================================================================

/**
 * Validates generated content against quality criteria
 */
export function validateGeneration(
  generated: GeneratedContent,
  constraint: Constraint
): ValidationResult {
  const issues: string[] = [];

  // Check framing length — only required when a pattern was detected
  if (generated.framing.length > 0 && generated.framing.length < 20) {
    issues.push('Framing too short (min 20 characters)');
  }
  if (generated.framing.length > 500) {
    issues.push('Framing too long (max 500 characters)');
  }

  // Check scope length
  if (generated.scope.length < 20) {
    issues.push('Scope too short (min 20 characters)');
  }
  if (generated.scope.length > 500) {
    issues.push('Scope too long (max 500 characters)');
  }

  // Check completion length
  if (generated.completion.length < 10) {
    issues.push('Completion criteria too short');
  }
  if (generated.completion.length > 300) {
    issues.push('Completion criteria too long');
  }

  // Check timebox is reasonable
  if (generated.timebox < 5 || generated.timebox > 120) {
    issues.push('Timebox out of range (5-120 minutes)');
  }

  // Check that framing doesn't literally repeat constraint name
  if (generated.framing.toLowerCase().includes(constraint.constraintName.toLowerCase())) {
    issues.push('Framing contains literal constraint name');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// ============================================================================
// STEP 5: MISSION ASSEMBLY
// ============================================================================

/**
 * Assembles the final mission object
 */
export function assembleMission(
  generated: GeneratedContent,
  constraint: Constraint,
  userProfile: UserProfile,
  workType: WorkType,
  generatedBy: 'gemini' | 'claude' | 'library' = 'library',
  patternDetected: boolean = true
): Mission {
  return {
    missionId: generateMissionId(),
    userId: userProfile.userId,
    createdAt: new Date(),
    status: 'pending',

    mode: constraint.mode,
    pattern: generated.patternName,
    patternDetected,

    framing: generated.framing,
    scope: generated.scope,
    constraintRule: generated.constraintName,
    completion: generated.completion,
    
    timebox: generated.timebox,
    
    generatedBy,
    constraintId: constraint.constraintId,
    archetype: userProfile.primaryArchetype,
    workType,
  };
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

/**
 * Main mission generation function
 * Orchestrates the complete pipeline with error handling and fallbacks
 * Supports dual LLM configuration: primary LLM with fallback to secondary
 */
export async function generateMission(
  userProfile: UserProfile
): Promise<Mission> {
  try {
    // STEP 1: Detect work type from description
    const workType = detectWorkType(userProfile.workDescription);

    // STEP 2: Detect mode from description
    const mode = detectMode(userProfile.workDescription);

    // STEP 3: Detect pattern from description (always)
    const detectionResult = detectPattern(userProfile.workDescription, userProfile.primaryArchetype);
    const pattern = detectionResult.pattern!;

    // STEP 4: Select matching constraint
    const constraint = selectConstraint(mode, pattern);

    // STEP 5: Get library examples (for context, always succeeds now)
    const libraryExamples = getLibraryExamples(
      constraint.constraintId,
      userProfile.primaryArchetype,
      workType
    );

    // STEP 6: Generate full mission content with primary LLM and fallback
    const primaryLlm = (process.env.PRIMARY_LLM || 'gemini') as 'gemini' | 'claude';
    const fallbackLlm = (process.env.FALLBACK_LLM || 'claude') as 'gemini' | 'claude';

    let generated: GeneratedContent;
    let usedLlm: 'gemini' | 'claude' | 'library' = primaryLlm;

    try {
      if (primaryLlm === 'claude') {
        generated = await generateMissionWithClaude(
          constraint,
          userProfile,
          pattern,
          workType
        );
      } else {
        generated = await generateMissionWithGemini(
          constraint,
          userProfile,
          pattern,
          workType
        );
      }
    } catch (primaryError) {
      console.warn(`[${primaryLlm}] generation failed, falling back to ${fallbackLlm}:`, primaryError);
      usedLlm = fallbackLlm;

      try {
        if (fallbackLlm === 'claude') {
          generated = await generateMissionWithClaude(
            constraint,
            userProfile,
            pattern,
            workType
          );
        } else {
          generated = await generateMissionWithGemini(
            constraint,
            userProfile,
            pattern,
            workType
          );
        }
      } catch (fallbackError) {
        console.error(`[${fallbackLlm}] fallback also failed:`, fallbackError);
        // Fall through to library fallback below
        generated = createGenericFallback(constraint, libraryExamples, workType, pattern.name);
        usedLlm = 'library';
      }
    }

    // STEP 7: Validate output
    const validation = validateGeneration(generated, constraint);

    if (!validation.valid) {
      console.warn('[Validation] Generated content invalid, using library fallback:', validation.issues);
      const fallback = createGenericFallback(constraint, libraryExamples, workType, pattern.name);
      return assembleMission(
        fallback,
        constraint,
        userProfile,
        workType,
        'library',
        detectionResult.matchCount > 0 && pattern.id !== 'generic_stall'
      );
    }

    // STEP 8: Assemble final mission
    // For LLM output: framing is empty-string when no pattern was detected
    // For library fallback: createGenericFallback always returns a non-empty framing,
    // so we must derive patternDetected from the detection result directly
    const patternDetected = usedLlm === 'library'
      ? detectionResult.matchCount > 0 && pattern.id !== 'generic_stall'
      : !!generated.framing;

    const mission = assembleMission(
      generated,
      constraint,
      userProfile,
      workType,
      usedLlm,
      patternDetected
    );

    return mission;
  } catch {
    // Re-throw — selectConstraint and detectPattern no longer throw on coverage gaps,
    // so if we're here something genuinely unexpected happened.
    throw new Error('Mission generation failed completely');
  }
}
