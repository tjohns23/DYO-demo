-- Migration: Fix Archetype Columns - Drop Slug, Ensure Name Exists
-- Purpose: Clean up archetype columns and ensure archetype_name is the single source of truth

-- Drop archetype_slug if it still exists
ALTER TABLE IF EXISTS public.profiles
  DROP COLUMN IF EXISTS archetype_slug CASCADE;

-- Drop archetype_id if it still exists
ALTER TABLE IF EXISTS public.profiles
  DROP COLUMN IF EXISTS archetype_id CASCADE;

-- Ensure archetype_name exists with CHECK constraint
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS archetype_name TEXT CHECK (archetype_name IN ('optimizer', 'strategist', 'visionary', 'advocate', 'politician', 'empath', 'builder', 'stabilizer'));

-- Documentation:
-- archetype_name: Stores the archetype identifier directly (e.g., 'optimizer')
-- This is the only archetype-related column in profiles
-- CHECK constraint ensures data integrity at the database level
