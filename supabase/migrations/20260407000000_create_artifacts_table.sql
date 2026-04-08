-- Create artifacts table
CREATE TABLE public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  
  -- File metadata
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  
  -- Verification status (for future AI/admin verification)
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  
  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Optional fields
  verification_notes TEXT
);

-- RLS: Enable Row Level Security
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own artifacts
CREATE POLICY "Users can view their own artifacts"
  ON public.artifacts
  FOR SELECT
  USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can insert their own artifacts"
  ON public.artifacts
  FOR INSERT
  WITH CHECK (auth.uid()::UUID = user_id);

-- Index for quick lookup by mission
CREATE INDEX idx_artifacts_mission_id ON public.artifacts (mission_id);
CREATE INDEX idx_artifacts_user_id ON public.artifacts (user_id);
