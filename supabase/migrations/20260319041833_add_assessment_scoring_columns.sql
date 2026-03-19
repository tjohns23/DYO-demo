-- Migration: Add Assessment Scoring Columns to Profiles
-- Purpose: Support the "Dimensional Scoring" model for DYO archetypes.

ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS perfectionism_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avoidance_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overthinking_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS scope_creep_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Documentation:
-- These columns store the raw totals calculated by the scoreAssessment Server Action.
-- Using 'integer' maps to 'int4' in the Supabase UI and 'number' in your generated types.