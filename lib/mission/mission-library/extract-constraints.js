/**
 * Extract and Structure Mission Library Data
 * 
 * This script:
 * 1. Parses mission_library_phase1.md for constraint metadata
 * 2. Extracts patterns from phase2 framings
 * 3. Generates constraints.json with mode → constraintId → metadata
 * 4. Generates patternMapping.json with mode → pattern → constraintIds[]
 * 5. Validates all 38 constraints are successfully loaded
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Path to current directory
const __filename = fileURLToPath(import.meta.url);
const LIBRARY_DIR = path.dirname(__filename);

// Constraint metadata extracted from Phase 1
const PHASE1_DATA = {
  IDEATE: [
    {
      id: "future_trend_adaptation",
      name: "Future Trend Adaptation",
      source: "Fast Forward!",
      category: "perspective_shift",
      timebox: 15,
      patterns: ["analysis_paralysis", "scope_creep"],
    },
    {
      id: "rapid_monetization",
      name: "Rapid Monetization",
      source: "Rethinking Revenue Streams",
      category: "scarcity_resource",
      timebox: 30,
      patterns: ["momentum_loss", "perfectionism_loop"],
    },
    {
      id: "competitor_collaboration",
      name: "Competitor Collaboration",
      source: "Over Saturated?",
      category: "perspective_shift",
      timebox: 45,
      patterns: ["analysis_paralysis", "scope_creep"],
    },
    {
      id: "ecosystem_mapping",
      name: "Ecosystem Mapping",
      source: "Creative Ecosystem",
      category: "time_based",
      timebox: 30,
      patterns: ["analysis_paralysis"],
    },
    {
      id: "rediscover_purpose",
      name: "Rediscover Purpose",
      source: "What Was the Reason?",
      category: "perspective_shift",
      timebox: 20,
      patterns: ["momentum_loss", "stagnation"],
    },
    {
      id: "six_word_pitch",
      name: "Six Word Pitch",
      source: "Say Less",
      category: "clarity_simplification",
      timebox: 10,
      patterns: ["overthinking", "scope_creep"],
    },
    {
      id: "old_school_marketing",
      name: "Old School Marketing",
      source: "Time-Travel Marketing",
      category: "perspective_shift",
      timebox: 30,
      patterns: ["analysis_paralysis"],
    },
    {
      id: "five_minute_brainstorm",
      name: "Five Minute Brainstorm",
      source: "5-Minute Brainstorm",
      category: "time_based",
      timebox: 5,
      patterns: ["analysis_paralysis", "overthinking"],
    },
    {
      id: "resource_limitation",
      name: "Resource Limitation",
      source: "Limited Resources",
      category: "scarcity_resource",
      timebox: 20,
      patterns: ["scope_creep"],
    },
    {
      id: "dream_collaboration",
      name: "Dream Collaboration",
      source: "Manifest Destiny",
      category: "accountability_exposure",
      timebox: 15,
      patterns: ["analysis_paralysis"],
    },
    {
      id: "fear_confrontation",
      name: "Fear Confrontation",
      source: "[DARE] The 'No Fear' Day",
      category: "accountability_exposure",
      timebox: 480,
      patterns: ["momentum_loss", "perfectionism_loop"],
    },
    {
      id: "tech_disconnect",
      name: "Tech Disconnect",
      source: "[DARE] Tech Disconnect",
      category: "focus_elimination",
      timebox: 60,
      patterns: ["momentum_loss"],
    },
    {
      id: "unfinished_revival",
      name: "Unfinished Revival",
      source: "[DARE] What Happened To...?",
      category: "focus_elimination",
      timebox: 30,
      patterns: ["momentum_loss", "stagnation"],
    },
    {
      id: "object_dialogue",
      name: "Object Dialogue",
      source: "[DARE] Imaginary Friends",
      category: "perspective_shift",
      timebox: 15,
      patterns: ["analysis_paralysis", "overthinking"],
    },
    {
      id: "present_challenge_reframe",
      name: "Present Challenge Reframe",
      source: "Honor Your Now",
      category: "perspective_shift",
      timebox: 10,
      patterns: ["momentum_loss", "perfectionism_loop"],
    },
  ],
  CREATE: [
    {
      id: "simplify_explanation",
      name: "Simplify Explanation",
      source: "Like I'm Five",
      category: "clarity_simplification",
      timebox: 20,
      patterns: ["overthinking", "analysis_paralysis"],
    },
    {
      id: "worst_idea_first",
      name: "Worst Idea First",
      source: "What's the Worst That Can Happen?",
      category: "perspective_shift",
      timebox: 15,
      patterns: ["perfectionism_loop"],
    },
    {
      id: "one_feature_focus",
      name: "One Feature Focus",
      source: "MVP Mindset",
      category: "focus_elimination",
      timebox: 60,
      patterns: ["scope_creep"],
    },
    {
      id: "analog_version",
      name: "Analog Version",
      source: "Go Analog",
      category: "perspective_shift",
      timebox: 30,
      patterns: ["overthinking", "scope_creep"],
    },
    {
      id: "existing_parts_only",
      name: "Existing Parts Only",
      source: "Frankenstein It",
      category: "scarcity_resource",
      timebox: 45,
      patterns: ["perfectionism_loop", "scope_creep"],
    },
    {
      id: "format_switch",
      name: "Format Switch",
      source: "Format Flip",
      category: "perspective_shift",
      timebox: 30,
      patterns: ["momentum_loss"],
    },
    {
      id: "speed_prototype",
      name: "Speed Prototype",
      source: "Rapid Prototype",
      category: "time_based",
      timebox: 60,
      patterns: ["perfectionism_loop", "analysis_paralysis"],
    },
    {
      id: "public_declaration",
      name: "Public Declaration",
      source: "Announce It Before You Build It",
      category: "accountability_exposure",
      timebox: 5,
      patterns: ["momentum_loss", "perfectionism_loop"],
    },
    {
      id: "daily_creation",
      name: "Daily Creation",
      source: "Create Every Day",
      category: "time_based",
      timebox: 60,
      patterns: ["momentum_loss", "stagnation"],
    },
    {
      id: "constraint_stacking",
      name: "Constraint Stacking",
      source: "Triple Constraint Challenge",
      category: "scarcity_resource",
      timebox: 45,
      patterns: ["scope_creep", "overthinking"],
    },
    {
      id: "reverse_engineering",
      name: "Reverse Engineering",
      source: "Work Backwards",
      category: "perspective_shift",
      timebox: 20,
      patterns: ["analysis_paralysis", "overthinking"],
    },
    {
      id: "sensory_constraint",
      name: "Sensory Constraint",
      source: "One Sense Only",
      category: "focus_elimination",
      timebox: 30,
      patterns: ["overthinking", "scope_creep"],
    },
  ],
  EXECUTE: [
    {
      id: "blitzkrieg_sprint",
      name: "Blitzkrieg Sprint",
      source: "Blitzkrieg",
      category: "time_based",
      timebox: 60,
      patterns: ["momentum_loss", "perfectionism_loop"],
    },
    {
      id: "ship_without_polish",
      name: "Ship Without Polish",
      source: "No Plan, No Problem",
      category: "action_before_planning",
      timebox: 30,
      patterns: ["perfectionism_loop", "over_polishing"],
    },
    {
      id: "ninety_second_pitch",
      name: "Ninety Second Pitch",
      source: "90 seconds or less",
      category: "clarity_simplification",
      timebox: 10,
      patterns: ["perfectionism_loop", "analysis_paralysis"],
    },
    {
      id: "stranger_feedback",
      name: "Stranger Feedback",
      source: "[DARE] Man On The Street",
      category: "accountability_exposure",
      timebox: 45,
      patterns: ["perfectionism_loop", "overthinking"],
    },
    {
      id: "radical_rebrand",
      name: "Radical Rebrand",
      source: "[DARE] The Rapid Rebrand",
      category: "perspective_shift",
      timebox: 10,
      patterns: ["analysis_paralysis", "overthinking"],
    },
    {
      id: "location_shift",
      name: "Location Shift",
      source: "[DARE] You Need to Leave",
      category: "focus_elimination",
      timebox: 60,
      patterns: ["momentum_loss"],
    },
    {
      id: "public_sabotage",
      name: "Public Sabotage",
      source: "[DARE] Shark Sabotage",
      category: "accountability_exposure",
      timebox: 30,
      patterns: ["perfectionism_loop", "ship_anxiety"],
    },
    {
      id: "resource_scavenging",
      name: "Resource Scavenging",
      source: "[RACs] Break Out",
      category: "scarcity_resource",
      timebox: 45,
      patterns: ["scope_creep", "perfectionism_loop"],
    },
    {
      id: "focus_breaks",
      name: "Focus Breaks",
      source: "[RACs] Brain Break",
      category: "focus_elimination",
      timebox: 60,
      patterns: ["momentum_loss"],
    },
    {
      id: "twenty_one_day_commitment",
      name: "Twenty One Day Commitment",
      source: "21-Day Project Power-Up",
      category: "time_based",
      timebox: 1440,
      patterns: ["momentum_loss", "stagnation"],
    },
    {
      id: "elimination_commitment",
      name: "Elimination Commitment",
      source: "The Power of 'No'",
      category: "focus_elimination",
      timebox: 15,
      patterns: ["scope_creep", "perfectionism_loop"],
    },
  ],
};

/**
 * Build constraints.json structure
 */
function buildConstraintsJSON() {
  const constraints = {
    IDEATE: {},
    CREATE: {},
    EXECUTE: {},
  };

  // Build each mode
  Object.entries(PHASE1_DATA).forEach(([mode, modeConstraints]) => {
    modeConstraints.forEach((constraint) => {
      constraints[mode][constraint.id] = {
        constraintName: constraint.name,
        sourceIDYTC: constraint.source,
        category: constraint.category,
        defaultTimebox: constraint.timebox,
      };
    });
  });

  return constraints;
}

/**
 * Build patternMapping.json structure
 */
function buildPatternMappingJSON() {
  const mapping = {
    IDEATE: {},
    CREATE: {},
    EXECUTE: {},
  };

  // Build each mode
  Object.entries(PHASE1_DATA).forEach(([mode, modeConstraints]) => {
    modeConstraints.forEach((constraint) => {
      constraint.patterns.forEach((pattern) => {
        if (!mapping[mode][pattern]) {
          mapping[mode][pattern] = [];
        }
        mapping[mode][pattern].push(constraint.id);
      });
    });
  });

  return mapping;
}

/**
 * Validate extracted data
 */
function validateData(constraints, patternMapping) {
  const validation = {
    passed: true,
    errors: [],
    warnings: [],
    summary: {},
  };

  // Count total constraints
  let totalConstraints = 0;
  let constraintsByMode = { IDEATE: 0, CREATE: 0, EXECUTE: 0 };

  Object.entries(constraints).forEach(([mode, modeConstraints]) => {
    const count = Object.keys(modeConstraints).length;
    constraintsByMode[mode] = count;
    totalConstraints += count;
  });

  // Validate mode counts
  if (constraintsByMode.IDEATE !== 15) {
    validation.passed = false;
    validation.errors.push(
      `Expected 15 IDEATE constraints, got ${constraintsByMode.IDEATE}`
    );
  }
  if (constraintsByMode.CREATE !== 12) {
    validation.passed = false;
    validation.errors.push(
      `Expected 12 CREATE constraints, got ${constraintsByMode.CREATE}`
    );
  }
  if (constraintsByMode.EXECUTE !== 11) {
    validation.passed = false;
    validation.errors.push(
      `Expected 11 EXECUTE constraints, got ${constraintsByMode.EXECUTE}`
    );
  }

  if (totalConstraints !== 38) {
    validation.passed = false;
    validation.errors.push(
      `Expected 38 total constraints, got ${totalConstraints}`
    );
  }

  // Validate pattern mapping entries
  let patternCount = 0;
  let mappingsByMode = { IDEATE: 0, CREATE: 0, EXECUTE: 0 };

  Object.entries(patternMapping).forEach(([mode, patterns]) => {
    const pCount = Object.keys(patterns).length;
    mappingsByMode[mode] = pCount;
    patternCount += pCount;
  });

  // Validate that all constraints appear in pattern mappings
  Object.entries(constraints).forEach(([mode, modeConstraints]) => {
    Object.keys(modeConstraints).forEach((constraintId) => {
      let found = false;
      Object.values(patternMapping[mode]).forEach((constraintIds) => {
        if (constraintIds.includes(constraintId)) {
          found = true;
        }
      });
      if (!found) {
        validation.warnings.push(
          `${constraintId} (${mode}) not mapped to any pattern`
        );
      }
    });
  });

  // Check for orphaned pattern mappings (pattern → constraintIds but constraint doesn't exist)
  Object.entries(patternMapping).forEach(([mode, patterns]) => {
    Object.entries(patterns).forEach(([pattern, constraintIds]) => {
      constraintIds.forEach((constraintId) => {
        if (!constraints[mode][constraintId]) {
          validation.passed = false;
          validation.errors.push(
            `${pattern} (${mode}) maps to non-existent constraint: ${constraintId}`
          );
        }
      });
    });
  });

  validation.summary = {
    totalConstraints,
    constraintsByMode,
    patternsCount: patternCount,
    patternsByMode: mappingsByMode,
  };

  return validation;
}

/**
 * Main execution
 */
function main() {
  console.log("🔄 Extracting Mission Library Data...\n");

  // Build JSON structures
  console.log("📊 Building constraints.json...");
  const constraints = buildConstraintsJSON();

  console.log("📊 Building patternMapping.json...");
  const patternMapping = buildPatternMappingJSON();

  // Validate
  console.log("✅ Validating extracted data...\n");
  const validation = validateData(constraints, patternMapping);

  // Write files
  const constraintsPath = path.join(LIBRARY_DIR, "constraints.json");
  const patternMappingPath = path.join(LIBRARY_DIR, "pattern-mapping.json");

  console.log("💾 Writing constraints.json...");
  fs.writeFileSync(constraintsPath, JSON.stringify(constraints, null, 2));
  console.log(`   ✓ Written to ${constraintsPath}`);

  console.log("💾 Writing pattern-mapping.json...");
  fs.writeFileSync(
    patternMappingPath,
    JSON.stringify(patternMapping, null, 2)
  );
  console.log(`   ✓ Written to ${patternMappingPath}`);

  // Report validation results
  console.log("\n" + "=".repeat(60));
  console.log("📋 VALIDATION REPORT");
  console.log("=".repeat(60) + "\n");

  if (validation.passed) {
    console.log("✅ All validations PASSED!\n");
  } else {
    console.log("❌ Validation FAILED\n");
  }

  console.log("Summary:");
  console.log(`  • Total Constraints: ${validation.summary.totalConstraints}`);
  console.log(
    `  • IDEATE Constraints: ${validation.summary.constraintsByMode.IDEATE}`
  );
  console.log(
    `  • CREATE Constraints: ${validation.summary.constraintsByMode.CREATE}`
  );
  console.log(
    `  • EXECUTE Constraints: ${validation.summary.constraintsByMode.EXECUTE}`
  );
  console.log(`  • Unique Patterns: ${validation.summary.patternsCount}`);
  console.log(
    `  • Patterns by Mode:`
  );
  console.log(
    `      - IDEATE: ${validation.summary.patternsByMode.IDEATE}`
  );
  console.log(
    `      - CREATE: ${validation.summary.patternsByMode.CREATE}`
  );
  console.log(
    `      - EXECUTE: ${validation.summary.patternsByMode.EXECUTE}`
  );

  if (validation.errors.length > 0) {
    console.log("\n❌ Errors:");
    validation.errors.forEach((err) => console.log(`   - ${err}`));
  }

  if (validation.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    validation.warnings.forEach((warn) => console.log(`   - ${warn}`));
  }

  console.log("\n" + "=".repeat(60) + "\n");

  if (!validation.passed) {
    process.exit(1);
  }

  console.log("🎉 Extract Complete!\n");
}

main();
