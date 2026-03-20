-- Migration: Add Quiz Answers and Archetype Scores to Profiles
-- Purpose: Persist both the raw quiz responses and the calculated archetype scores

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS quiz_answers integer[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS archetype_scores jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS assessment_completed_at timestamptz DEFAULT NULL;

-- Documentation:
-- quiz_answers: Array of 1-5 Likert responses indexed by question ID (0-19 for Q1-Q20)
--   Example: [5, 4, 3, 5, 2, ...]
-- archetype_scores: JSONB object mapping archetype slug to raw score
--   Example: {"optimizer": 28, "strategist": 15, "visionary": 22, "advocate": 18, ...}
-- assessment_completed_at: Timestamp when the assessment was completed
