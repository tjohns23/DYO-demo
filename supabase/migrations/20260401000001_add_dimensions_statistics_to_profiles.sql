-- Add statistics JSONB column and last_mission_id FK to profiles table

-- NOTE: dimension_scores already exists (added in 20260322000001_add_dimensions_column.sql)
-- It has shape: { perfectionism, systemsThinking, visionSeeking, purposeOrientation, socialEnergy, emotionalSensitivity, structurePreference, stabilityNeed }
-- We use the existing dimension_scores column - no need to duplicate

-- Add statistics JSONB column (computed/cached)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS statistics JSONB DEFAULT jsonb_build_object(
  'completionRate', 0,
  'totalGenerated', 0,
  'totalCompleted', 0,
  'totalExpired', 0,
  'averageCompletionTime', NULL,
  'currentStreak', 0,
  'outcomesByPeriod', jsonb_build_object(
    'last7Days', jsonb_build_object('completed', 0, 'expired', 0),
    'last30Days', jsonb_build_object('completed', 0, 'expired', 0),
    'allTime', jsonb_build_object('completed', 0, 'expired', 0)
  ),
  'commonPatterns', '[]'::jsonb,
  'recentMissions', '[]'::jsonb,
  'lastUpdated', NOW()::text
);

-- Add column for tracking last mission (helpful for quick queries)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_mission_id UUID REFERENCES public.missions (id) ON DELETE SET NULL;

-- Create index on statistics for potential JSONB queries
CREATE INDEX IF NOT EXISTS idx_profiles_statistics
  ON public.profiles USING gin (statistics);

-- Add comment explaining the statistics object
COMMENT ON COLUMN public.profiles.statistics IS 
'Computed and cached statistics for mission dashboard. Updated on-demand after mission events.
Contains: completionRate, totalGenerated, totalCompleted, totalExpired, averageCompletionTime,
currentStreak, outcomesByPeriod, commonPatterns, recentMissions, lastUpdated.
NOTE: Assessment dimensions are stored in existing dimension_scores column.';
