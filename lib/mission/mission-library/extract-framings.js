#!/usr/bin/env node

/**
 * Extract Archetype Framings from Markdown Files
 * 
 * Reads Phase 2-4 markdown files and extracts constraint framings for each archetype.
 * Outputs to archetype-framings.json with validation and warnings.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Archetype display names to slugs mapping
const ARCHETYPE_MAP = {
  'Optimizer': 'optimizer',
  'Strategist': 'strategist',
  'Visionary': 'visionary',
  'Advocate': 'advocate',
  'Politician': 'politician',
  'Empath': 'empath',
  'Builder': 'builder',
  'Stabilizer': 'stabilizer',
};

const ARCHETYPE_SLUGS = Object.values(ARCHETYPE_MAP);

// Read constraints.json to get all constraint IDs
function loadConstraints() {
  const constraintsPath = path.join(__dirname, 'constraints.json');
  const data = JSON.parse(fs.readFileSync(constraintsPath, 'utf-8'));
  
  const allConstraints = new Set();
  for (const mode of Object.values(data)) {
    for (const constraintId of Object.keys(mode)) {
      allConstraints.add(constraintId);
    }
  }
  
  return allConstraints;
}

// Read all markdown files
function readMarkdownFiles() {
  const files = [
    'mission_library_phase2_part1.md',
    'mission_library_phase2_part2.md',
    'mission_library_phase2_part3.md',
    'mission_library_phase2_part4.md',
    'mission_library_phase3_part1.md',
    'mission_library_phase3_part2.md',
    'mission_library_phase3_part3.md',
    'mission_library_phase3_part4.md',
    'mission_library_phase4_final.md',
  ];
  
  let allContent = '';
  for (const file of files) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      allContent += '\n\n' + content;
    }
  }
  
  return allContent;
}

// Convert constraint name to constraint ID (e.g., "FUTURE_TREND_ADAPTATION" -> "future_trend_adaptation")
function constraintNameToId(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w]/g, '');
}

// Extract constraint title from markdown (e.g., "### 1. FUTURE_TREND_ADAPTATION" or "### future_trend_adaptation")
function extractConstraintTitle(line) {
  const match = line.match(/###\s+\d+\.\s+(.+?)$/i);
  if (match) {
    const title = match[1].trim();
    // Convert various formats to snake_case constraint ID
    return title
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w]/g, '');
  }
  return null;
}

// Parse framings from markdown content
function parseFramings(content) {
  const framings = {};
  
  const lines = content.split('\n');
  let currentConstraint = null;
  let currentArchetype = null;
  let currentFraming = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect constraint header (### N. CONSTRAINT_NAME or ### constraint_name)
    const constraintTitle = extractConstraintTitle(line);
    if (constraintTitle) {
      // Save previous archetype framing if exists
      if (currentConstraint && currentArchetype && currentFraming.length > 0) {
        if (!framings[currentConstraint]) {
          framings[currentConstraint] = {};
        }
        framings[currentConstraint][currentArchetype] = currentFraming.join('\n').trim();
      }
      
      currentConstraint = constraintTitle;
      currentArchetype = null;
      currentFraming = [];
      continue;
    }
    
    // Detect archetype header (e.g., "**Optimizer:**" or "**Optimizer:**\n")
    const archetypeMatch = line.match(/^\*\*(\w+):\*\*\s*$/);
    if (archetypeMatch && currentConstraint) {
      // Save previous archetype framing
      if (currentArchetype && currentFraming.length > 0) {
        if (!framings[currentConstraint]) {
          framings[currentConstraint] = {};
        }
        framings[currentConstraint][currentArchetype] = currentFraming.join('\n').trim();
      }
      
      const archetypeName = archetypeMatch[1];
      const slug = ARCHETYPE_MAP[archetypeName];
      
      if (slug) {
        currentArchetype = slug;
        currentFraming = [];
      } else {
        currentArchetype = null;
      }
      continue;
    }
    
    // Collect framing text
    if (currentArchetype && line.trim()) {
      // Stop at next constraint or archetype header
      if (line.match(/^###/) || line.match(/^\*\*\w+:\*\*/)) {
        continue;
      }
      currentFraming.push(line);
    }
  }
  
  // Save last framing
  if (currentConstraint && currentArchetype && currentFraming.length > 0) {
    if (!framings[currentConstraint]) {
      framings[currentConstraint] = {};
    }
    framings[currentConstraint][currentArchetype] = currentFraming.join('\n').trim();
  }
  
  return framings;
}

// Validate framings coverage
function validateFramings(framings, allConstraints) {
  const warnings = [];
  const missing = [];
  
  // Check all constraints have all archetypes
  for (const constraintId of allConstraints) {
    if (!framings[constraintId]) {
      missing.push(`❌ MISSING CONSTRAINT: ${constraintId}`);
      continue;
    }
    
    for (const archetype of ARCHETYPE_SLUGS) {
      if (!framings[constraintId][archetype]) {
        warnings.push(`⚠️  MISSING ARCHETYPE: ${constraintId}[${archetype}]`);
      }
    }
  }
  
  // Check for framings not in constraints.json
  for (const constraintId of Object.keys(framings)) {
    if (!allConstraints.has(constraintId)) {
      warnings.push(`⚠️  UNEXPECTED CONSTRAINT IN FRAMINGS: ${constraintId}`);
    }
  }
  
  return { warnings, missing };
}

// Main execution
function main() {
  console.log('🚀 Extracting Archetype Framings...\n');
  
  // Load constraints
  const allConstraints = loadConstraints();
  console.log(`📋 Found ${allConstraints.size} constraints in constraints.json`);
  
  // Read markdown files
  console.log('📖 Reading markdown files...');
  const content = readMarkdownFiles();
  
  // Parse framings
  console.log('🔍 Parsing framings...');
  const framings = parseFramings(content);
  
  console.log(`✅ Extracted framings for ${Object.keys(framings).length} constraints\n`);
  
  // Validate
  console.log('🔎 Validating coverage...\n');
  const { warnings, missing } = validateFramings(framings, allConstraints);
  
  if (missing.length > 0) {
    missing.forEach(msg => console.log(msg));
    console.log();
  }
  
  if (warnings.length > 0) {
    warnings.forEach(msg => console.log(msg));
    console.log();
  }
  
  // Summary
  const totalExpected = allConstraints.size * ARCHETYPE_SLUGS.length;
  const totalExtracted = Object.keys(framings).reduce((sum, constraintId) => {
    return sum + Object.keys(framings[constraintId]).length;
  }, 0);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total framings expected: ${totalExpected}`);
  console.log(`   Total framings extracted: ${totalExtracted}`);
  console.log(`   Coverage: ${((totalExtracted / totalExpected) * 100).toFixed(1)}%`);
  
  if (missing.length === 0 && warnings.filter(w => w.includes('MISSING')).length === 0) {
    console.log(`\n✨ All constraints have complete archetype framings!\n`);
  } else {
    console.log(`\n⚠️  There are gaps in framing coverage. Review warnings above.\n`);
  }
  
  // Write to JSON
  const outputPath = path.join(__dirname, 'archetype-framings.json');
  fs.writeFileSync(outputPath, JSON.stringify(framings, null, 2));
  console.log(`💾 Written to ${outputPath}\n`);
}

main();
