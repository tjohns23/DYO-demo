-- Migration: Ensure Schema Parity Between Dev and Prod
-- Purpose: Verify all tables exist with correct schema in prod
-- This migration is idempotent and should work whether run fresh or on existing schemas

-- ============================================================================
-- 1. PROFILES TABLE (created first to avoid circular dependencies)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Assessment & Archetype data
  quiz_answers INTEGER[],
  archetype_scores JSONB,
  dimension_scores JSONB NOT NULL DEFAULT '{"perfectionism": 0, "avoidance": 0, "overthinking": 0, "scope_creep": 0}'::jsonb,
  archetype_slug TEXT,
  secondary_archetype_slug TEXT,
  tertiary_archetype_slug TEXT,
  calibration_answers JSONB,
  assessment_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Profile data
  beta_approved BOOLEAN,
  
  -- Mission tracking (will add FK constraint after missions table exists)
  last_mission_id UUID,
  
  -- Statistics
  statistics JSONB,
  
  -- Pro/Exec flags
  is_pro BOOLEAN DEFAULT false,
  is_exec BOOLEAN DEFAULT false,
  
  PRIMARY KEY (id)
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_archetype_slug ON public.profiles(archetype_slug);
CREATE INDEX IF NOT EXISTS idx_profiles_assessment_completed_at ON public.profiles(assessment_completed_at);

-- ============================================================================
-- 2. ASSESSMENTS TABLE (depends on profiles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_answers INTEGER[] NOT NULL,
  archetype_scores JSONB NOT NULL,
  dimension_scores JSONB NOT NULL,
  archetype_slug TEXT,
  secondary_archetype_slug TEXT,
  tertiary_archetype_slug TEXT,
  calibration_answers JSONB,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for assessments
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON public.assessments(completed_at DESC);

-- ============================================================================
-- 3. MISSIONS TABLE (can now reference profiles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expired_at TIMESTAMP WITH TIME ZONE,
  
  -- Status & immutability
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'expired')),
  
  -- Mission content (immutable after accepted)
  framing TEXT NOT NULL,
  scope TEXT NOT NULL,
  constraint_rule TEXT NOT NULL,
  completion TEXT NOT NULL,
  
  -- Mission parameters
  mode TEXT NOT NULL CHECK (mode IN ('IDEATE', 'CREATE', 'EXECUTE')),
  pattern TEXT NOT NULL,
  work_type TEXT NOT NULL CHECK (work_type IN ('writing', 'coding', 'design', 'content', 'strategy', 'pitch', 'general')),
  timebox INTEGER NOT NULL,
  
  -- Generation tracking
  constraint_id TEXT NOT NULL,
  archetype TEXT NOT NULL,
  generated_by TEXT NOT NULL CHECK (generated_by IN ('gemini', 'library')),
  
  -- Reference for context
  work_description TEXT NOT NULL,
  
  -- Computed field (null until completed)
  time_to_completion INTEGER,
  
  -- Thought parking (optional notes during mission)
  thought_parking TEXT,
  
  -- Constraints
  CONSTRAINT time_to_completion_after_completed CHECK (
    (status = 'completed' AND time_to_completion IS NOT NULL) OR 
    (status != 'completed' AND time_to_completion IS NULL)
  )
);

-- Create indexes for missions
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON public.missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON public.missions(created_at DESC);

-- Add FK constraint from profiles to missions (now that missions exists)
ALTER TABLE public.profiles 
  ADD CONSTRAINT fk_profiles_last_mission_id 
  FOREIGN KEY (last_mission_id) REFERENCES public.missions(id) ON DELETE SET NULL;

-- ============================================================================
-- 4. ARTIFACTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- File metadata
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  
  -- Verification status
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  
  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Optional fields
  verification_notes TEXT
);

-- Create indexes for artifacts
CREATE INDEX IF NOT EXISTS idx_artifacts_mission_id ON public.artifacts(mission_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_user_id ON public.artifacts(user_id);

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY (if not already enabled)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view their own assessments" ON public.assessments;
  DROP POLICY IF EXISTS "Users can insert their own assessments" ON public.assessments;
  DROP POLICY IF EXISTS "Users can update their own assessments" ON public.assessments;
  DROP POLICY IF EXISTS "Users can access their own missions" ON public.missions;
  DROP POLICY IF EXISTS "Users can insert their own missions" ON public.missions;
  DROP POLICY IF EXISTS "Users can update their own missions" ON public.missions;
  DROP POLICY IF EXISTS "Users can view their own artifacts" ON public.artifacts;
  DROP POLICY IF EXISTS "Users can insert their own artifacts" ON public.artifacts;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Assessments RLS Policies
CREATE POLICY "Users can view their own assessments"
  ON public.assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
  ON public.assessments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Missions RLS Policies
CREATE POLICY "Users can access their own missions"
  ON public.missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own missions"
  ON public.missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions"
  ON public.missions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Artifacts RLS Policies
CREATE POLICY "Users can view their own artifacts"
  ON public.artifacts FOR SELECT
  USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can insert their own artifacts"
  ON public.artifacts FOR INSERT
  WITH CHECK (auth.uid()::UUID = user_id);
