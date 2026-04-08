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

  // DESIGN - visual work (check before coding to avoid conflicts with "develop")
  if (
    text.match(
      /\b(design|designing|logo|ui|ux|visual|brand|mockup|mockups|layout|graphic|wireframe|wireframing|prototype|prototyping)\b/
    )
  ) {
    return "design";
  }

  // STRATEGY - planning/analysis (check before coding to avoid conflicts)
  if (
    text.match(
      /\b(plan|planning|strategy|roadmap|analysis|analyze|analyzing|analyzed|research|researching|researched|decide|decision|choosing|choose|evaluate|evaluating|evaluated)\b/
    )
  ) {
    return "strategy";
  }

  // CONTENT - media creation
  if (
    text.match(
      /\b(video|podcast|social|content|youtube|tiktok|instagram|recording|filming|editing)\b/
    )
  ) {
    return "content";
  }

  // PITCH - presentation work
  if (
    text.match(
      /\b(pitch|presentation|deck|present|presenting|fundrais|fundraising|investor|investors|sales|demo|convince|convincing)\b/
    )
  ) {
    return "pitch";
  }

  // WRITING - specific writing keywords (after design/strategy to avoid conflicts)
  if (
    text.match(
      /\b(blog|article|post|email|copy|script|essay|draft|drafting|paragraph|intro)\b/
    )
  ) {
    return "writing";
  }

  // CODING - technical terms (check last to avoid false positives)
  if (
    text.match(
      /\b(code|coding|coded|api|feature|bug|debug|debugging|debugged|program|programming|app|function|database|deploy|deploying|deployed)\b/
    )
  ) {
    return "coding";
  }

  // GENERAL - fallback if no clear match
  return "general";
}
