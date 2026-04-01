#!/usr/bin/env node

/**
 * Add relevantPatterns to constraints.json
 * 
 * Reads pattern-mapping.json and inverts it to add relevantPatterns arrays
 * to each constraint in constraints.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function main() {
  console.log('🚀 Adding relevantPatterns to constraints...\n');
  
  // Read files
  const patternMappingPath = path.join(__dirname, 'pattern-mapping.json');
  const constraintsPath = path.join(__dirname, 'constraints.json');
  
  const patternMapping = JSON.parse(fs.readFileSync(patternMappingPath, 'utf-8'));
  const constraints = JSON.parse(fs.readFileSync(constraintsPath, 'utf-8'));
  
  console.log('📖 Read pattern-mapping.json and constraints.json');
  
  // Invert pattern mapping: constraint -> [patterns]
  const constraintPatterns = {};
  
  Object.entries(patternMapping).forEach(([mode, patterns]) => {
    Object.entries(patterns).forEach(([patternId, constraintIds]) => {
      constraintIds.forEach(constraintId => {
        if (!constraintPatterns[constraintId]) {
          constraintPatterns[constraintId] = [];
        }
        constraintPatterns[constraintId].push(patternId);
      });
    });
  });
  
  console.log(`\n🔄 Inverted mapping for ${Object.keys(constraintPatterns).length} constraints`);
  
  // Add relevantPatterns to each constraint
  let updated = 0;
  Object.entries(constraints).forEach(([mode, modeConstraints]) => {
    Object.entries(modeConstraints).forEach(([constraintId, constraint]) => {
      if (constraintPatterns[constraintId]) {
        constraint.relevantPatterns = constraintPatterns[constraintId].sort();
        updated++;
      } else {
        console.warn(`⚠️  No patterns found for constraint: ${constraintId}`);
        constraint.relevantPatterns = [];
      }
    });
  });
  
  console.log(`✅ Updated ${updated} constraints with relevantPatterns\n`);
  
  // Validate
  let hasRelevantPatterns = 0;
  let missingRelevantPatterns = [];
  
  Object.entries(constraints).forEach(([mode, modeConstraints]) => {
    Object.entries(modeConstraints).forEach(([constraintId, constraint]) => {
      if (constraint.relevantPatterns && constraint.relevantPatterns.length > 0) {
        hasRelevantPatterns++;
      } else {
        missingRelevantPatterns.push(constraintId);
      }
    });
  });
  
  console.log(`📊 Validation:`);
  console.log(`   Constraints with patterns: ${hasRelevantPatterns}`);
  console.log(`   Constraints without patterns: ${missingRelevantPatterns.length}`);
  
  if (missingRelevantPatterns.length > 0) {
    console.log(`   ❌ Missing: ${missingRelevantPatterns.join(', ')}`);
  }
  
  // Write updated constraints.json
  fs.writeFileSync(constraintsPath, JSON.stringify(constraints, null, 2));
  console.log(`\n💾 Updated ${constraintsPath}\n`);
  
  // Show examples
  console.log('📋 Examples:\n');
  const examples = Object.entries(constraints).slice(0, 1);
  examples.forEach(([mode, modeConstraints]) => {
    const firstConstraint = Object.entries(modeConstraints)[0];
    const [constraintId, constraint] = firstConstraint;
    console.log(`${constraintId}:`);
    console.log(`  relevantPatterns: ${JSON.stringify(constraint.relevantPatterns)}`);
  });
}

main();
