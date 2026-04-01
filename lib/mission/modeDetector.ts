/**
 * Mode Detection Engine
 * Detects the stage of work from user work descriptions
 * Modes: IDEATE, CREATE, EXECUTE
 */

export type Mode = "IDEATE" | "CREATE" | "EXECUTE";

// Keywords for detecting each mode from work descriptions
const IDEATE_KEYWORDS = [
  "choosing",
  "deciding",
  "figuring out which",
  "trying to decide",
  "which direction",
  "what to",
  "should i",
  "picking",
  "selecting",
];

const CREATE_KEYWORDS = [
  "building",
  "making",
  "creating",
  "writing",
  "designing",
  "developing",
  "working on",
  "drafting",
  "coding",
];

const EXECUTE_KEYWORDS = [
  "finishing",
  "shipping",
  "publishing",
  "sending",
  "launching",
  "completing",
  "wrapping up",
  "final",
  "almost done",
  "ready to",
];

/**
 * Detects the mode of work based on keywords in the work description
 * @param workDescription - User's description of what they're working on
 * @returns The detected mode (IDEATE, CREATE, or EXECUTE)
 */
export function detectMode(workDescription: string): Mode {
  const lowerDescription = workDescription.toLowerCase();

  // Check for IDEATE keywords
  for (const keyword of IDEATE_KEYWORDS) {
    if (lowerDescription.includes(keyword)) {
      return "IDEATE";
    }
  }

  // Check for EXECUTE keywords
  for (const keyword of EXECUTE_KEYWORDS) {
    if (lowerDescription.includes(keyword)) {
      return "EXECUTE";
    }
  }

  // Check for CREATE keywords
  for (const keyword of CREATE_KEYWORDS) {
    if (lowerDescription.includes(keyword)) {
      return "CREATE";
    }
  }

  // Default to CREATE if no keywords match
  return "CREATE";
}
