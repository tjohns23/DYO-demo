#!/usr/bin/env node

/**
 * Extract Work-Type Scopes from Markdown Files
 * 
 * Reads Phase 3 markdown files and extracts constraint scopes for each work type.
 * Outputs to work_type_scopes.json with validation and warnings.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Work types as defined in Phase 3
const WORK_TYPES = [
  'writing',
  'coding',
  'design',
  'content',
  'strategy',
  'pitch'
];

// Work type display names to slugs mapping
const WORK_TYPE_MAP = {
  'WRITING': 'writing',
  'CODING': 'coding',
  'DESIGN': 'design',
  'CONTENT': 'content',
  'STRATEGY': 'strategy',
  'PITCH': 'pitch',
};

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

// Read all Phase 3 markdown files
function readPhase3Files() {
  const files = [
    'mission_library_phase3_part1.md',
    'mission_library_phase3_part2.md',
    'mission_library_phase3_part3.md',
    'mission_library_phase3_part4.md',
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

// Parse scopes from markdown content
function parseScopes(content) {
  const scopes = {};
  
  const lines = content.split('\n');
  let currentConstraint = null;
  let currentWorkType = null;
  let scopeText = '';
  let completionText = '';
  let capturingScope = false;
  let capturingCompletion = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect constraint header (### N. CONSTRAINT_NAME)
    const constraintTitle = extractConstraintTitle(line);
    if (constraintTitle) {
      // Save previous work type scope if exists
      if (currentConstraint && currentWorkType && scopeText && completionText) {
        if (!scopes[currentConstraint]) {
          scopes[currentConstraint] = {};
        }
        scopes[currentConstraint][currentWorkType] = {
          scope: scopeText.trim(),
          completion: completionText.trim()
        };
      }
      
      currentConstraint = constraintTitle;
      currentWorkType = null;
      scopeText = '';
      completionText = '';
      capturingScope = false;
      capturingCompletion = false;
      continue;
    }
    
    // Detect work type header (e.g., "**WRITING**" or "**writing**")
    const workTypeMatch = line.match(/^\*\*([A-Z]+)\*\*\s*$/i);
    if (workTypeMatch && currentConstraint) {
      // Save previous work type scope
      if (currentWorkType && scopeText && completionText) {
        if (!scopes[currentConstraint]) {
          scopes[currentConstraint] = {};
        }
        scopes[currentConstraint][currentWorkType] = {
          scope: scopeText.trim(),
          completion: completionText.trim()
        };
      }
      
      const workTypeName = workTypeMatch[1].toUpperCase();
      const slug = WORK_TYPE_MAP[workTypeName];
      
      if (slug) {
        currentWorkType = slug;
        scopeText = '';
        completionText = '';
        capturingScope = false;
        capturingCompletion = false;
      }
      continue;
    }
    
    // Detect "- Scope:" line
    if (line.match(/^-\s+Scope:\s+/i) && currentWorkType) {
      scopeText = line.replace(/^-\s+Scope:\s+/i, '');
      capturingScope = true;
      capturingCompletion = false;
      continue;
    }
    
    // Detect "- Completion:" line
    if (line.match(/^-\s+Completion:\s+/i) && currentWorkType) {
      completionText = line.replace(/^-\s+Completion:\s+/i, '');
      capturingCompletion = true;
      capturingScope = false;
      continue;
    }
    
    // Continue capturing scope (multi-line, indented continuation)
    if (capturingScope && line.match(/^\s{2,}/) && !line.match(/^-\s+/)) {
      scopeText += ' ' + line.trim();
      continue;
    }
    
    // Continue capturing completion (multi-line, indented continuation)
    if (capturingCompletion && line.match(/^\s{2,}/) && !line.match(/^-\s+/)) {
      completionText += ' ' + line.trim();
      continue;
    }
    
    // Stop capturing on new section or blank line followed by new constraint/worktype
    if (capturingScope || capturingCompletion) {
      if (line.trim() === '' || line.match(/^###/) || line.match(/^\*\*/)) {
        capturingScope = false;
        capturingCompletion = false;
      }
    }
  }
  
  // Save last work type scope
  if (currentConstraint && currentWorkType && scopeText && completionText) {
    if (!scopes[currentConstraint]) {
      scopes[currentConstraint] = {};
    }
    scopes[currentConstraint][currentWorkType] = {
      scope: scopeText.trim(),
      completion: completionText.trim()
    };
  }
  
  return scopes;
}

// Validate scopes coverage
function validateScopes(scopes, allConstraints) {
  const warnings = [];
  const missing = [];
  
  // Check all constraints have all work types
  for (const constraintId of allConstraints) {
    if (!scopes[constraintId]) {
      missing.push(`❌ MISSING CONSTRAINT: ${constraintId}`);
      continue;
    }
    
    for (const workType of WORK_TYPES) {
      if (!scopes[constraintId][workType]) {
        warnings.push(`⚠️  MISSING WORK TYPE: ${constraintId}[${workType}]`);
      } else {
        // Validate scope and completion fields exist
        const workTypeData = scopes[constraintId][workType];
        if (!workTypeData.scope || !workTypeData.scope.trim()) {
          warnings.push(`⚠️  EMPTY SCOPE: ${constraintId}[${workType}]`);
        }
        if (!workTypeData.completion || !workTypeData.completion.trim()) {
          warnings.push(`⚠️  EMPTY COMPLETION: ${constraintId}[${workType}]`);
        }
      }
    }
  }
  
  // Check for scopes not in constraints.json
  for (const constraintId of Object.keys(scopes)) {
    if (!allConstraints.has(constraintId)) {
      warnings.push(`⚠️  UNEXPECTED CONSTRAINT IN SCOPES: ${constraintId}`);
    }
  }
  
  return { warnings, missing };
}

// Main execution
function main() {
  console.log('🚀 Extracting Work-Type Scopes...\n');
  
  // Load constraints
  const allConstraints = loadConstraints();
  console.log(`📋 Found ${allConstraints.size} constraints in constraints.json`);
  
  // Read Phase 3 files
  console.log('📖 Reading Phase 3 markdown files...');
  const content = readPhase3Files();
  
  // Parse scopes
  console.log('🔍 Parsing scopes...');
  const scopes = parseScopes(content);
  
  console.log(`✅ Extracted scopes for ${Object.keys(scopes).length} constraints\n`);
  
  // Validate
  console.log('🔎 Validating coverage...\n');
  const { warnings, missing } = validateScopes(scopes, allConstraints);
  
  if (missing.length > 0) {
    missing.forEach(msg => console.log(msg));
    console.log();
  }
  
  if (warnings.length > 0) {
    warnings.forEach(msg => console.log(msg));
    console.log();
  }
  
  // Summary
  const totalExpected = allConstraints.size * WORK_TYPES.length;
  const totalExtracted = Object.keys(scopes).reduce((sum, constraintId) => {
    return sum + Object.keys(scopes[constraintId]).length;
  }, 0);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total scopes expected: ${totalExpected}`);
  console.log(`   Total scopes extracted: ${totalExtracted}`);
  console.log(`   Coverage: ${((totalExtracted / totalExpected) * 100).toFixed(1)}%`);
  
  if (missing.length === 0 && warnings.filter(w => w.includes('MISSING')).length === 0) {
    console.log(`\n✨ All constraints have complete work-type scopes!\n`);
  } else {
    console.log(`\n⚠️  There are gaps in scope coverage. Review warnings above.\n`);
  }
  
  // Write to JSON
  const outputPath = path.join(__dirname, 'work_type_scopes.json');
  fs.writeFileSync(outputPath, JSON.stringify(scopes, null, 2));
  console.log(`💾 Written to ${outputPath}\n`);
}

main();
