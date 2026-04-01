/**
 * Work Type Detection Engine
 * Identifies the category of work from user descriptions
 * Work Types: writing, coding, design, content, strategy, pitch, general
 */

export type WorkType =
  | "writing"
  | "coding"
  | "design"
  | "content"
  | "strategy"
  | "pitch"
  | "general";

/**
 * Detects the work type based on keyword patterns in the work description
 * @param workDescription - User's description of what they're working on
 * @returns The detected work type
 */
export function detectWorkType(workDescription: string): WorkType {
  const text = workDescription.toLowerCase();

  // WRITING - strongest signals first
  if (
    text.match(
      /\b(blog|article|post|email|copy|script|writing|essay|draft|paragraph|intro|content)\b/
    )
  ) {
    return "writing";
  }

  // CODING - technical terms
  if (
    text.match(
      /\b(code|coding|feature|bug|debug|develop|programming|app|function|API|database|deploy)\b/
    )
  ) {
    return "coding";
  }

  // DESIGN - visual work
  if (
    text.match(
      /\b(design|logo|UI|UX|visual|brand|mockup|layout|graphic|wireframe|prototype)\b/
    )
  ) {
    return "design";
  }

  // CONTENT - media creation
  if (
    text.match(
      /\b(video|podcast|social|content|youtube|tiktok|instagram|recording|filming|editing)\b/
    )
  ) {
    return "content";
  }

  // STRATEGY - planning/analysis
  if (
    text.match(
      /\b(plan|planning|strategy|roadmap|analysis|analyze|research|decide|decision|choosing|evaluate)\b/
    )
  ) {
    return "strategy";
  }

  // PITCH - presentation work
  if (
    text.match(
      /\b(pitch|presentation|deck|present|fundrais|investor|sales|demo|convince)\b/
    )
  ) {
    return "pitch";
  }

  // GENERAL - fallback if no clear match
  return "general";
}
