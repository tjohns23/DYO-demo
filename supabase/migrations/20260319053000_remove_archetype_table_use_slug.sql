-- Migration: Remove Archetype Table Dependency, Store Name Directly
-- Purpose: Simplify architecture by storing archetype_name as text instead of FK UUID

-- Drop old archetype columns and constraints
ALTER TABLE IF EXISTS public.profiles
  DROP CONSTRAINT IF EXISTS profiles_archetype_id_fkey,
  DROP COLUMN IF EXISTS archetype_id,
  DROP COLUMN IF EXISTS archetype_slug;

-- Add archetype_name column with CHECK constraint (ensures valid archetype)
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS archetype_name TEXT CHECK (archetype_name IN ('optimizer', 'strategist', 'visionary', 'advocate', 'politician', 'empath', 'builder', 'stabilizer'));

-- Documentation:
-- archetype_name: Stores the archetype identifier directly (e.g., 'optimizer')
-- No FK to archetypes table needed — archetypes are immutable and defined in code
-- CHECK constraint ensures data integrity at the database level
