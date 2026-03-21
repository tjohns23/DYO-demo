-- Migration: Create Assessments Table
-- Purpose: Store individual assessment attempts with quiz answers and archetype scores

CREATE TABLE IF NOT EXISTS public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_answers integer[] NOT NULL,
  archetype_scores jsonb NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index on user_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);

-- Create index on completed_at for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON public.assessments(completed_at DESC);

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own assessments
CREATE POLICY "Users can view their own assessments" ON public.assessments
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own assessments
CREATE POLICY "Users can insert their own assessments" ON public.assessments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own assessments
CREATE POLICY "Users can update their own assessments" ON public.assessments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
