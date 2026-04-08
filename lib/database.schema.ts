/**
 * DATABASE SCHEMA MAPPING
 * 
 * New tables and updated columns for Mission Engine
 */

// ============================================================================
// MISSIONS TABLE
// ============================================================================

export interface DatabaseMission {
  // Primary key & relationships
  id: string; // uuid
  user_id: string; // uuid, foreign key → profiles.id
  
  // Timestamps
  created_at: string; // timestamp with time zone
  accepted_at: string | null; // timestamp with time zone
  completed_at: string | null; // timestamp with time zone
  expired_at: string | null; // timestamp with time zone
  
  // Status & immutability
  status: 'pending' | 'accepted' | 'completed' | 'expired';
  
  // Mission content (immutable after accepted)
  framing: string;
  scope: string;
  constraint_rule: string;
  completion: string;
  
  // Mission parameters
  mode: 'IDEATE' | 'CREATE' | 'EXECUTE';
  pattern: string;
  work_type: 'writing' | 'coding' | 'design' | 'content' | 'strategy' | 'pitch' | 'general';
  timebox: number; // minutes
  
  // Generation tracking
  constraint_id: string;
  archetype: string;
  generated_by: 'gemini' | 'library';
  
  // Reference (for audit/context)
  work_description: string;
  
  // Computed field (useful for analytics)
  time_to_completion: number | null; // seconds (elapsed time from acceptance to completion)
}

// ============================================================================
// PROFILES TABLE - UPDATES
// ============================================================================

export interface DatabaseProfile {
  // Existing fields (unchanged)
  id: string; // uuid
  user_id: string; // uuid, auth.users foreign key
  email: string;
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
  
  // Archetype & Assessment (existing)
  primary_archetype: string;
  secondary_archetype: string | null;
  tertiary_archetype: string | null;
  assessment_completed: boolean;
  
  // EXISTING: Assessment dimensions (stored in dimension_scores column)
  // Shape: { perfectionism, systemsThinking, visionSeeking, purposeOrientation,
  //          socialEnergy, emotionalSensitivity, structurePreference, stabilityNeed }
  dimension_scores: {
    perfectionism: number;
    systemsThinking: number;
    visionSeeking: number;
    purposeOrientation: number;
    socialEnergy: number;
    emotionalSensitivity: number;
    structurePreference: number;
    stabilityNeed: number;
  };
  
  // NEW: Mission statistics (computed, cached JSONB)
  statistics: {
    // Core metrics
    completionRate: number; // 0-1
    totalGenerated: number;
    totalCompleted: number;
    totalExpired: number;
    averageCompletionTime: number | null; // minutes
    currentStreak: number;
    
    // Outcome breakdown by period
    outcomesByPeriod: {
      last7Days: { completed: number; expired: number };
      last30Days: { completed: number; expired: number };
      allTime: { completed: number; expired: number };
    };
    
    // Most common stall patterns
    commonPatterns: Array<{
      patternId: string;
      patternName: string;
      count: number;
      completionRate: number;
    }>;
    
    // Recent mission summaries (last 20 for quick display)
    recentMissions: Array<{
      id: string;
      createdAt: string;
      status: 'completed' | 'expired' | 'pending' | 'accepted';
      mode: string;
      pattern: string;
      timebox: number;
      completionTime: number | null;
    }>;
    
    // Metadata
    lastUpdated: string; // timestamp
  };
  
  // NEW: FK to last mission
  last_mission_id: string | null; // uuid
}

// ============================================================================
// SCHEMA NOTES
// ============================================================================

/**
 * MISSIONS TABLE
 * 
 * - user_id (fk) ensures Row Level Security works
 * - status transitions: pending → accepted → completed
 *                      pending → expired
 * - accepted_at is when mission becomes IMMUTABLE
 * - time_to_completion = computed from timestamps (useful for analytics)
 * - work_description stored for context/debugging
 * 
 * INDEXES:
 * - (user_id, created_at DESC) for quick user mission history
 * - (user_id, status) for querying completed/expired missions
 * - (status) for admin queries
 */

/**
 * PROFILES TABLE UPDATES
 * 
 * EXISTING dimension_scores JSONB:
 * - Already exists (added in migration 20260322000001_add_dimensions_column.sql)
 * - Maps from assessment quiz scores
 * - Shape: { perfectionism, systemsThinking, visionSeeking, purposeOrientation,
 *            socialEnergy, emotionalSensitivity, structurePreference, stabilityNeed }
 * - No duplication; we use this existing column
 * 
 * NEW statistics object (JSONB):
 * - Computed on-demand after each mission event
 * - Contains pre-aggregated data for dashboard
 * - recentMissions = lightweight summaries (not full mission objects)
 * - Full history queried from missions table when needed
 * - lastUpdated = timestamp of last computation
 * 
 * NEW last_mission_id FK:
 * - Quick reference to user's most recent mission
 * - Supports indexed lookups
 * 
 * Computation triggers:
 * - After mission created (pending)
 * - After mission accepted
 * - After mission completed/expired
 * 
 * INDEXES:
 * - statistics should be indexed if frequently queried in WHERE clause
 *   (but usually accessed after primary key lookup, so may not need index)
 */
