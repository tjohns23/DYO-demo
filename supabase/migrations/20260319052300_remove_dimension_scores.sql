-- Migration: Remove Old Dimension Score Columns from Profiles
-- Purpose: Clean up the profiles table by removing dimension-based scoring columns
-- that have been replaced with archetype-based scoring

ALTER TABLE IF EXISTS public.profiles
  DROP COLUMN IF EXISTS perfectionism_score,
  DROP COLUMN IF EXISTS avoidance_score,
  DROP COLUMN IF EXISTS overthinking_score,
  DROP COLUMN IF EXISTS scope_creep_score;

-- Documentation:
-- These columns stored raw dimension totals from the old assessment model.
-- The new assessment model scores directly to archetypes, so these are no longer needed.
-- The archetype assignment is stored via the archetype_id foreign key.
