-- Migration: Rename archetype_name to archetype_slug for clarity
-- Purpose: Store the archetype slug identifier (e.g., 'optimizer') instead of the display name

-- Drop the existing archetype_name column
ALTER TABLE IF EXISTS public.profiles
  DROP COLUMN IF EXISTS archetype_name CASCADE;

-- Add archetype_slug column with CHECK constraint (ensures valid archetype slug)
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS archetype_slug TEXT CHECK (archetype_slug IN ('optimizer', 'strategist', 'visionary', 'advocate', 'politician', 'empath', 'builder', 'stabilizer'));

-- Documentation:
-- archetype_slug: Stores the unique archetype identifier (e.g., 'optimizer', 'advocate')
-- Used to lookup metadata from ARCHETYPE_METADATA in code
-- CHECK constraint ensures data integrity at the database level
