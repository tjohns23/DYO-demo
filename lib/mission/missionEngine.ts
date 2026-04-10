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
import type { ArchetypeSlug } from '@/lib/actions/assessment';
import { detectMode, type Mode } from './modeDetector';
import { detectWorkType, type WorkType } from './workTypeDetector';
import { detectPattern, type Pattern } from './patternDetector';

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
}

/**
 * Generated content from Gemini
 */
export interface GeneratedContent {
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
  
  // Content (mix of AI + library)
  framing: string;
  scope: string;
  constraintRule: string;
  completion: string;
  
  // Parameters
  timebox: number;
  
  // Tracking
  generatedBy: 'gemini' | 'library';
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

  const workTypeScopesForConstraint = workTypeScopesTyped[constraintId];

  if (!workTypeScopesForConstraint) {
    return [];
  }

  const availableWorkTypes = Object.keys(workTypeScopesForConstraint) as WorkType[];

  // Return diverse examples (max 3, covering different work types)
  const selectedTypes = availableWorkTypes.slice(0, 3);

  return selectedTypes.map(workType => ({
    workType,
    scope: workTypeScopesForConstraint[workType].scope,
    completion: workTypeScopesForConstraint[workType].completion,
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
  libraryExamples: LibraryExamples,
  pattern: Pattern,
  workType: WorkType
): Promise<GeneratedContent> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return createGenericFallback(constraint, libraryExamples, workType);
  }

  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: modelName });

    // Get representative examples to show Gemini the style
    const examples = getRepresentativeExamples(constraint.constraintId);
    
    const examplesText = examples
      .map(
        (ex, i) =>
          `Example ${i + 1} (${ex.workType}):
     Scope: ${ex.scope}
     Completion: ${ex.completion}`
      )
      .join('\n\n');

    const framingNote = libraryExamples.framingExact
      ? `Archetype framing: "${libraryExamples.framing}" (exact match for ${userProfile.primaryArchetype})`
      : `No exact archetype framing found for ${userProfile.primaryArchetype} + this constraint. Generate framing from scratch based on the pattern and archetype description.`;

    const scopeNote = libraryExamples.scopeExact
      ? `Scope/completion example for ${workType}: Scope: "${libraryExamples.scope}" / Completion: "${libraryExamples.completion}" (exact match)`
      : examples.length > 0
        ? `No exact scope example for "${workType}" work type. Closest available examples shown above — adapt the style for ${workType}.`
        : `No scope examples found for this constraint. Generate scope and completion criteria from scratch based on the constraint description.`;

    const prompt = `You are a mission-generation AI for DYO, a productivity app for perfectionists.

USER CONTEXT:
- Archetype: ${userProfile.primaryArchetype}
- Work Description: "${userProfile.workDescription}"
- Detected Pattern: ${pattern.name}
- Work Type: ${workType}

CONSTRAINT: ${constraint.constraintName}
- Category: ${constraint.category}
- Default Timebox: ${constraint.defaultTimebox} minutes

LIBRARY MATCH QUALITY:
- ${framingNote}
- ${scopeNote}

REFERENCE LIBRARY EXAMPLES (style and format guide):
${examplesText || '(No examples available — generate based on constraint and user context above.)'}

TASK: Generate a personalized mission following the constraint pattern above.

Return a JSON object with exactly these fields:
{
  "scope": "Specific, actionable scope for this user's ${workType} work (1-2 sentences)",
  "completion": "Clear completion criteria (1 sentence, what 'done' looks like)",
  "framing": "2-3 sentence framing explaining why this mission works for their ${userProfile.primaryArchetype} archetype and ${pattern.name} pattern",
  "timebox": number between 5 and 120 (minutes, can be different from default)
}

Important:
- Make the scope specific to "${workType}" work
- Ground the framing in their "${pattern.name}" pattern
- Timebox should be realistic for one focused session
- Return ONLY valid JSON, no markdown or extra text`;

    const responsePromise = model.generateContent(prompt);
    const response = await withTimeout(responsePromise, 30000); // 30 second timeout
    const text = response.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return createGenericFallback(constraint, libraryExamples, workType);
    }

    const result = JSON.parse(jsonMatch[0]) as {
      scope?: string;
      completion?: string;
      framing?: string;
      timebox?: number;
    };

    // Validate response has all required fields
    if (!result.scope || !result.completion || !result.framing || !result.timebox) {
      return createGenericFallback(constraint, libraryExamples, workType);
    }

    return {
      scope: result.scope,
      completion: result.completion,
      framing: result.framing,
      timebox: result.timebox,
    };
  } catch (error) {
    return createGenericFallback(constraint, libraryExamples, workType);
  }
}

/**
 * Creates a generic fallback mission when Gemini is unavailable
 */
function createGenericFallback(
  constraint: Constraint,
  libraryExamples: LibraryExamples,
  workType: WorkType
): GeneratedContent {
  return {
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

  // Check framing length (min 20 chars, max 500 chars)
  if (generated.framing.length < 20) {
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
  pattern: Pattern,
  generatedBy: 'gemini' | 'library' = 'library'
): Mission {
  return {
    missionId: generateMissionId(),
    userId: userProfile.userId,
    createdAt: new Date(),
    status: 'pending',
    
    mode: constraint.mode,
    pattern: pattern.name,
    
    framing: generated.framing,
    scope: generated.scope,
    constraintRule: constraint.constraintName,
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

    // STEP 6: Generate full mission content with Gemini
    const generated = await generateMissionWithGemini(
      constraint,
      userProfile,
      libraryExamples,
      pattern,
      workType
    );

    // STEP 7: Validate output
    const validation = validateGeneration(generated, constraint);

    if (!validation.valid) {
      const fallback = createGenericFallback(constraint, libraryExamples, workType);
      return assembleMission(
        fallback,
        constraint,
        userProfile,
        workType,
        pattern,
        'library'
      );
    }

    // STEP 8: Assemble final mission
    const mission = assembleMission(
      generated,
      constraint,
      userProfile,
      workType,
      pattern,
      'gemini'
    );

    return mission;
  } catch (error) {

    // Re-throw — selectConstraint and detectPattern no longer throw on coverage gaps,
    // so if we're here something genuinely unexpected happened.
    throw new Error('Mission generation failed completely');
  }
}
