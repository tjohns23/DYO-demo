-- Create missions table
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  
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
  
  -- Indexes for common queries
  CONSTRAINT time_to_completion_after_completed CHECK (
    (status = 'completed' AND time_to_completion IS NOT NULL) OR 
    (status != 'completed' AND time_to_completion IS NULL)
  )
);

-- RLS: Enable Row Level Security
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own missions
CREATE POLICY "Users can access their own missions"
  ON public.missions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_missions_user_id_created_at_desc 
  ON public.missions (user_id, created_at DESC);

CREATE INDEX idx_missions_user_id_status 
  ON public.missions (user_id, status);

CREATE INDEX idx_missions_status 
  ON public.missions (status);
