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
  // These can be auto-detected or passed in:
  detectedWorkType?: WorkType;
  detectedPattern?: Pattern;
  detectedMode?: Mode;
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
}

/**
 * Generated content from Gemini
 */
export interface GeneratedContent {
  framing: string;
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
  constraint: string;
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
  return `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format pattern name for display (e.g., "perfectionism_loop" → "Perfectionism Loop")
 */
function formatPatternName(patternId: string): string {
  return patternId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================================
// STEP 1: CONSTRAINT SELECTION
// ============================================================================

/**
 * Selects a random constraint matching the pattern and mode
 */
export function selectConstraint(
  _userProfile: UserProfile,
  mode: Mode,
  pattern: Pattern
): Constraint {
  const constraints = constraintsData as Record<string, Record<string, {
    constraintName: string;
    category: string;
    defaultTimebox: number;
    relevantPatterns: string[];
  }>>;

  const modeConstraints = constraints[mode];
  
  if (!modeConstraints) {
    throw new Error(`No constraints found for mode: ${mode}`);
  }

  // Filter constraints that include this pattern
  const matchingConstraintIds = Object.keys(modeConstraints).filter(constraintId => {
    const constraint = modeConstraints[constraintId];
    return constraint.relevantPatterns.includes(pattern.id);
  });

  if (matchingConstraintIds.length === 0) {
    throw new Error(
      `No matching constraints for mode ${mode} and pattern ${pattern.id}`
    );
  }

  // Pick randomly from matches
  const selectedId =
    matchingConstraintIds[Math.floor(Math.random() * matchingConstraintIds.length)];
  
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
 * Retrieves library examples from JSON files
 */
export function getLibraryExamples(
  constraintId: string,
  archetype: ArchetypeSlug,
  workType: WorkType
): LibraryExamples {
  // Get framing from archetype-framings.json
  const archetypeFramings = archetypeFramingsData as Record<string, Record<string, string>>;
  const archetypeFramingsByConstraint = archetypeFramings[constraintId];
  
  if (!archetypeFramingsByConstraint) {
    throw new Error(`No framings found for constraint: ${constraintId}`);
  }

  const framing =
    archetypeFramingsByConstraint[archetype] ||
    'Your work pattern has been identified. This mission will help you break through.';

  // Get scope and completion from work_type_scopes.json
  const workTypeScopesTyped = workTypeScopesData as Record<string, Record<string, {
    scope: string;
    completion: string;
  }>>;
  
  const workTypeScopesForConstraint = workTypeScopesTyped[constraintId];
  
  if (!workTypeScopesForConstraint) {
    throw new Error(`No work type scopes found for constraint: ${constraintId}`);
  }

  const scopeData = workTypeScopesForConstraint[workType];
  
  if (!scopeData) {
    throw new Error(
      `No scope found for constraint ${constraintId} and work type ${workType}`
    );
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
    scope: scopeData.scope,
    completion: scopeData.completion,
    constraintRule,
  };
}

// ============================================================================
// STEP 3: GEMINI GENERATION
// ============================================================================

/**
 * Generates personalized framing with Gemini
 * (In production, this would call the actual Gemini API)
 */
export async function generateMissionWithGemini(
  constraint: Constraint,
  userProfile: UserProfile,
  examples: LibraryExamples,
  pattern: Pattern
): Promise<GeneratedContent> {
  // TODO: Use userProfile and pattern to build the Gemini prompt
  void userProfile;
  void pattern;

  // Example prompt (for reference):
  // `You are a supportive but firm mission-generation AI for a productivity app called DYO.
  // Generate a personalized 2-3 sentence framing that explains why the "${constraint.constraintName}" 
  // constraint works specifically for this user's archetype and situation.
  // User: ${userProfile.primaryArchetype}, Pattern: ${pattern.name}
  // ...`

  try {
    // TODO: Replace with actual Gemini API call
    // For now, return the library framing as a placeholder
    return {
      framing: examples.framing,
    };
  } catch (error) {
    console.error('Gemini generation failed:', error);
    throw error;
  }
}

// ============================================================================
// STEP 4: VALIDATION
// ============================================================================

/**
 * Validates generated content against quality criteria
 */
export function validateGeneration(
  generated: GeneratedContent,
  constraint: Constraint,
  userProfile: UserProfile
): ValidationResult {
  const issues: string[] = [];

  // TODO: Consider adding archetype-specific validation rules
  void userProfile;

  // Check framing length (min 20 chars, max 500 chars)
  if (generated.framing.length < 20) {
    issues.push('Framing too short (min 20 characters)');
  }
  if (generated.framing.length > 500) {
    issues.push('Framing too long (max 500 characters)');
  }

  // Check that framing doesn't literally repeat constraint name
  if (
    generated.framing
      .toLowerCase()
      .includes(constraint.constraintName.toLowerCase())
  ) {
    issues.push('Framing contains literal constraint name');
  }

  // Check that framing contains at least some specificity
  if (
    generated.framing.split(' ').length < 10 &&
    generated.framing.length < 100
  ) {
    issues.push('Framing lacks sufficient detail');
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
  libraryExamples: LibraryExamples,
  userProfile: UserProfile,
  workType: WorkType,
  generatedBy: 'gemini' | 'library' = 'library'
): Mission {
  return {
    missionId: generateMissionId(),
    userId: userProfile.userId,
    createdAt: new Date(),
    status: 'pending',
    
    mode: constraint.mode,
    pattern: formatPatternName(`pattern_${constraint.mode.toLowerCase()}`),
    
    framing: generated.framing,
    scope: libraryExamples.scope,
    constraint: libraryExamples.constraintRule,
    completion: libraryExamples.completion,
    
    timebox: constraint.defaultTimebox,
    
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
    // STEP 1: Detect work type (if not provided)
    const workType = userProfile.detectedWorkType || detectWorkType(userProfile.workDescription);

    // STEP 2: Detect mode (if not provided)
    const mode = userProfile.detectedMode || detectMode(userProfile.workDescription);

    // STEP 3: Detect pattern (if not provided)
    let pattern: Pattern;
    if (userProfile.detectedPattern) {
      pattern = userProfile.detectedPattern;
    } else {
      const detectionResult = detectPattern(userProfile.workDescription, userProfile.primaryArchetype);
      if (!detectionResult.pattern) {
        throw new Error('Could not detect work pattern');
      }
      pattern = detectionResult.pattern;
    }

    console.log(`[Mission] Detected: mode=${mode}, workType=${workType}, pattern=${pattern.name}`);

    // STEP 4: Select matching constraint
    const constraint = selectConstraint(userProfile, mode, pattern);
    console.log(`[Mission] Selected constraint: ${constraint.constraintId}`);

    // STEP 5: Get library examples
    const libraryExamples = getLibraryExamples(
      constraint.constraintId,
      userProfile.primaryArchetype,
      workType
    );
    console.log('[Mission] Retrieved library examples');

    // STEP 6: Generate with Gemini
    const generated = await generateMissionWithGemini(
      constraint,
      userProfile,
      libraryExamples,
      pattern
    );
    console.log('[Mission] Generated framing with Gemini');

    // STEP 7: Validate output
    const validation = validateGeneration(generated, constraint, userProfile);

    if (!validation.valid) {
      console.warn(
        `[Mission] Validation failed: ${validation.issues.join(', ')}. Falling back to library framing.`
      );

      // Fallback: Use library framing
      return assembleMission(
        { framing: libraryExamples.framing },
        constraint,
        libraryExamples,
        userProfile,
        workType,
        'library'
      );
    }

    // STEP 8: Assemble final mission
    const mission = assembleMission(
      generated,
      constraint,
      libraryExamples,
      userProfile,
      workType,
      'gemini'
    );

    console.log('[Mission] Mission generated successfully');
    return mission;
  } catch (error) {
    console.error('[Mission] Generation failed:', error);

    // Ultimate fallback: Use library-only mission
    try {
      const workType = detectWorkType(userProfile.workDescription);
      const mode = detectMode(userProfile.workDescription);
      const detectionResult = detectPattern(userProfile.workDescription, userProfile.primaryArchetype);
      
      if (!detectionResult.pattern) {
        throw new Error('Could not generate fallback mission - pattern detection failed');
      }

      const pattern = detectionResult.pattern;
      const constraint = selectConstraint(userProfile, mode, pattern);
      const libraryExamples = getLibraryExamples(
        constraint.constraintId,
        userProfile.primaryArchetype,
        workType
      );

      return assembleMission(
        { framing: libraryExamples.framing },
        constraint,
        libraryExamples,
        userProfile,
        workType,
        'library'
      );
    } catch (fallbackError) {
      console.error('[Mission] Fallback generation also failed:', fallbackError);
      throw new Error('Mission generation failed completely');
    }
  }
}
