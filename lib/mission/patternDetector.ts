/**
 * Pattern Detection Engine
 * Identifies stall patterns from user work descriptions
 * Matches patterns against user archetype for scored detection
 */

import type { ArchetypeSlug } from '@/lib/actions/assessment';

export interface Pattern {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  associatedArchetypes: ArchetypeSlug[];
  description?: string;
}

export interface DetectionResult {
  pattern: Pattern | null;
  score: number;
  matchCount: number;
}


const PATTERN_LIBRARY: Pattern[] = [
  // OPTIMIZER PATTERNS
  {
    id: "perfectionism_loop",
    name: "Perfectionism Loop",
    category: "Optimizer",
    keywords: [
      "keep rewriting", "keep editing", "keep revising", "keep tweaking",
      "never finished", "almost done", "just need to polish",
      "not good enough", "needs more work", "one more pass",
      "keep improving", "making it better", "refining"
    ],
    associatedArchetypes: ["optimizer", "visionary", "advocate"],
    description: "You're stuck in endless refinement. Each pass feels productive, but somewhere along the way, 'making it better' became a way to avoid calling it done. This is common for your archetype.[cite: 1]"
  },
  {
    id: "ship_anxiety",
    name: "Ship Anxiety",
    category: "Optimizer",
    keywords: [
      "afraid to publish", "scared to share", "nervous about releasing",
      "what if people", "worried about", "don't want to",
      "not ready to share", "hesitant to post", "anxious about shipping",
      "fear of", "terrified", "dreading"
    ],
    associatedArchetypes: ["optimizer", "empath", "stabilizer"],
    description: "You're afraid of the vulnerability that comes with shipping. The work might be ready, but you're not ready to be seen. This keeps you in the safety of 'almost done.'[cite: 1]"
  },
  {
    id: "over_polishing",
    name: "Over-Polishing",
    category: "Optimizer",
    keywords: [
      "final touches", "adding details", "making it prettier",
      "cleaning up", "polishing", "smoothing out",
      "just tweaking", "minor adjustments", "small changes",
      "almost perfect", "finishing touches"
    ],
    associatedArchetypes: ["optimizer", "builder"],
    description: "The work is functionally complete, but you're in polish mode. Each small improvement feels necessary, but it's delaying delivery without adding real value.[cite: 1]"
  },

  // STRATEGIST PATTERNS
  {
    id: "analysis_paralysis",
    name: "Analysis Paralysis",
    category: "Strategist",
    keywords: [
      "can't decide", "too many options", "weighing pros and cons",
      "considering all the", "analyzing", "comparing",
      "trying to figure out", "thinking through", "evaluating",
      "don't know which", "uncertain about", "unclear which path"
    ],
    associatedArchetypes: ["strategist", "stabilizer", "advocate"],
    description: "You're stuck analyzing options instead of choosing one. More information won't make the decision easier—it'll just give you more variables to optimize.[cite: 1]"
  },
  {
    id: "research_rabbit_hole",
    name: "Research Rabbit Hole",
    category: "Strategist",
    keywords: [
      "need to research", "learning about", "reading up on",
      "studying", "investigating", "exploring how",
      "trying to understand", "looking into", "gathering information",
      "need to know more", "researching", "deep dive"
    ],
    associatedArchetypes: ["strategist", "optimizer"],
    description: "Research feels productive, but you've crossed the line from learning to avoiding. You have enough information to start—more research won't change that.[cite: 1]"
  },
  {
    id: "optimization_before_action",
    name: "Optimization-Before-Action",
    category: "Strategist",
    keywords: [
      "want to plan", "need to map out", "designing the system",
      "thinking through the architecture", "planning the approach",
      "outlining the strategy", "figuring out the best way",
      "optimizing before", "perfecting the plan"
    ],
    associatedArchetypes: ["strategist", "builder"],
    description: "You're designing the perfect system instead of building an imperfect one. The plan will never be as good as the execution will teach you to make it.[cite: 1]"
  },

  // VISIONARY PATTERNS
  {
    id: "scope_creep",
    name: "Scope Creep",
    category: "Visionary",
    keywords: [
      "adding features", "expanding to include", "also want to",
      "should also", "what if we", "maybe we could add",
      "thinking about adding", "growing the scope", "making it bigger",
      "keep adding", "including more", "extending it to"
    ],
    associatedArchetypes: ["visionary", "advocate"],
    description: "Your vision keeps expanding. What started as one thing is now three things. Each addition feels essential, but the growing scope is preventing you from shipping anything.[cite: 1]"
  },
  {
    id: "idea_proliferation",
    name: "Idea Proliferation",
    category: "Visionary",
    keywords: [
      "new idea", "just thought of", "what about",
      "another approach", "different direction", "pivot to",
      "actually maybe", "better idea", "instead we could",
      "switching to", "changing direction", "new direction"
    ],
    associatedArchetypes: ["visionary", "strategist"],
    description: "You generate ideas faster than you execute them. Each new idea feels better than the last, but this pattern means you finish nothing while starting everything.[cite: 1]"
  },
  {
    id: "context_switching",
    name: "Context Switching",
    category: "Visionary",
    keywords: [
      "jumping between", "working on multiple", "switching between",
      "doing several", "multitasking", "back and forth",
      "different projects", "moving between", "bouncing around"
    ],
    associatedArchetypes: ["visionary", "politician"],
    description: "You're working on multiple things simultaneously. Each switch feels productive, but you're making slow progress on everything instead of fast progress on one thing.[cite: 1]"
  },

  // ADVOCATE PATTERNS
  {
    id: "misalignment_fatigue",
    name: "Misalignment Fatigue",
    category: "Advocate",
    keywords: [
      "doesn't feel right", "not aligned with", "doesn't match my values",
      "feels wrong", "misaligned", "not meaningful",
      "don't believe in", "conflicts with", "doesn't serve",
      "feels extractive", "doesn't matter", "pointless"
    ],
    associatedArchetypes: ["advocate", "empath"],
    description: "The work feels misaligned with what you care about. Your body is rejecting it because it doesn't serve something meaningful. You can't force execution when purpose is missing.[cite: 1]"
  },
  {
    id: "values_conflict_avoidance",
    name: "Values Conflict Avoidance",
    category: "Advocate",
    keywords: [
      "compromises my", "violates my", "goes against",
      "feels unethical", "morally", "integrity",
      "selling out", "not authentic", "fake",
      "betrays", "contradicts what I"
    ],
    associatedArchetypes: ["advocate"],
    description: "You physically can't execute because it feels like a violation of your principles. This isn't procrastination—it's integrity. But you're stuck between 'do it wrong' and 'do nothing.'[cite: 1]"
  },
  {
    id: "impact_uncertainty",
    name: "Impact Uncertainty",
    category: "Advocate",
    keywords: [
      "will this help", "does this matter", "is this useful",
      "will anyone care", "is this valuable", "making a difference",
      "unsure if this", "don't know if", "questioning whether",
      "does this serve", "is this worth"
    ],
    associatedArchetypes: ["advocate", "empath"],
    description: "You're stalling because you can't see the impact clearly. Without knowing you're helping someone, the work feels hollow. You need to see the 'why' to access the 'how.'[cite: 1]"
  },

  // POLITICIAN PATTERNS
  {
    id: "isolation_stall",
    name: "Isolation Stall",
    category: "Politician",
    keywords: [
      "working alone", "by myself", "no one to",
      "isolated", "solo", "on my own",
      "no feedback", "no one's watching", "nobody knows",
      "doing this alone", "just me"
    ],
    associatedArchetypes: ["politician", "advocate"],
    description: "You're losing momentum because you're working in isolation. You execute through connection, not solitude. Working alone drains your energy instead of generating it.[cite: 1]"
  },
  {
    id: "low_visibility_disengagement",
    name: "Low Visibility Disengagement",
    category: "Politician",
    keywords: [
      "no one will see", "won't get feedback", "working in private",
      "no visibility", "hidden", "behind the scenes",
      "not sharing", "keeping it private", "under the radar"
    ],
    associatedArchetypes: ["politician", "optimizer"],
    description: "You're avoiding work that won't be seen. Without visibility or feedback, you can't access the social energy that fuels your execution.[cite: 1]"
  },

  // EMPATH PATTERNS
  {
    id: "exposure_anxiety",
    name: "Exposure Anxiety",
    category: "Empath",
    keywords: [
      "feels vulnerable", "exposing myself", "people will judge",
      "scared of criticism", "afraid of", "nervous about sharing",
      "putting myself out there", "being seen", "fear of judgment",
      "what will people think", "terrified", "anxious about"
    ],
    associatedArchetypes: ["empath", "optimizer", "stabilizer"],
    description: "Shipping means being seen, and being seen feels dangerous. The work is ready, but you're protecting yourself from the vulnerability of exposure.[cite: 1]"
  },
  {
    id: "criticism_paralysis",
    name: "Criticism Paralysis",
    category: "Empath",
    keywords: [
      "last time someone", "got harsh feedback", "was criticized",
      "someone said", "negative comments", "mean feedback",
      "hurt by", "still recovering from", "can't stop thinking about",
      "afraid it'll happen again", "scared of more"
    ],
    associatedArchetypes: ["empath", "advocate"],
    description: "Previous harsh feedback is still affecting you. You're protecting yourself from experiencing that pain again by not shipping anything new.[cite: 1]"
  },

  // BUILDER PATTERNS
  {
    id: "system_absence_paralysis",
    name: "System Absence Paralysis",
    category: "Builder",
    keywords: [
      "don't have a process", "no system for", "unclear how to",
      "no structure", "undefined", "messy",
      "no clear steps", "don't know the process", "need a framework",
      "chaotic", "disorganized", "no method"
    ],
    associatedArchetypes: ["builder", "strategist"],
    description: "You thrive on executing within clear systems, but the system doesn't exist yet. You're frozen because you can't execute in chaos—you need rails to run on.[cite: 1]"
  },
  {
    id: "undefined_input_freeze",
    name: "Undefined Input Freeze",
    category: "Builder",
    keywords: [
      "inputs are unclear", "don't know what I'm working with",
      "requirements keep changing", "undefined scope", "moving target",
      "unclear expectations", "what am I supposed to", "don't have the info",
      "missing information", "incomplete brief"
    ],
    associatedArchetypes: ["builder", "stabilizer"],
    description: "You're frozen because the inputs are fuzzy. You execute flawlessly with clarity, but you can't start without knowing exactly what you're working with.[cite: 1]"
  },

  // STABILIZER PATTERNS
  {
    id: "ambiguity_anxiety",
    name: "Ambiguity Anxiety",
    category: "Stabilizer",
    keywords: [
      "unclear", "ambiguous", "uncertain", "don't know what's expected",
      "not sure what", "confused about", "unclear expectations",
      "don't understand", "vague", "what does success look like",
      "how will I know", "what should I", "worried I'll do it wrong"
    ],
    associatedArchetypes: ["stabilizer", "builder", "empath"],
    description: "The lack of clarity is creating genuine anxiety. You need to know what 'right' looks like before you can start. Ambiguity feels like a test you can't study for.[cite: 1]"
  },
  {
    id: "initiation_avoidance",
    name: "Initiation Avoidance",
    category: "Stabilizer",
    keywords: [
      "don't know where to start", "haven't started", "can't begin",
      "stuck at the beginning", "paralyzed", "frozen",
      "need to start", "should start", "trying to start",
      "can't get started", "starting is the hardest part"
    ],
    associatedArchetypes: ["stabilizer", "empath", "builder"],
    description: "The first step feels impossible because you don't know if it's the 'right' first step. You're waiting for certainty that will never come. Starting requires tolerance for not-knowing.[cite: 1]"
  }
];

/**
 * Detects the primary stall pattern from work description
 * @param workDescription - User's description of what they're working on
 * @param userArchetype - The user's archetype
 * @returns Detection result with matched pattern, score, and match count
 */
export function detectPattern(
  workDescription: string,
  userArchetype: ArchetypeSlug
): DetectionResult {
  const text = workDescription.toLowerCase();
  const detectedPatterns: Array<{
    pattern: Pattern;
    score: number;
    matchCount: number;
  }> = [];

  // Check each pattern's keywords
  for (const pattern of PATTERN_LIBRARY) {
    let matchCount = 0;

    // Count keyword matches
    for (const keyword of pattern.keywords) {
      if (text.includes(keyword)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      // Calculate base score
      let score = matchCount;

      // Boost if pattern matches user's archetype
      if (pattern.associatedArchetypes.includes(userArchetype)) {
        score *= 2; // Double for archetype match
      }

      detectedPatterns.push({
        pattern,
        score,
        matchCount,
      });
    }
  }

  // Return highest-scoring pattern, or null if no matches
  if (detectedPatterns.length > 0) {
    detectedPatterns.sort((a, b) => b.score - a.score);
    return {
      pattern: detectedPatterns[0].pattern,
      score: detectedPatterns[0].score,
      matchCount: detectedPatterns[0].matchCount,
    };
  }

  return {
    pattern: null,
    score: 0,
    matchCount: 0,
  };
}
