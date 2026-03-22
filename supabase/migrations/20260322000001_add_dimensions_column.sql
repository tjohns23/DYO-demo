-- Migration: add_dimensions_column
-- Created: 2026-03-22

-- Description:
-- Adds a dimension_scores jsonb column to both profiles and assessments.
-- profiles.dimension_scores stores the user's latest dimensional scores for
-- use in mission generation. assessments.dimension_scores stores the scores
-- at the time of each assessment for analytics and history.
--
-- Shape mirrors DimensionalScores in lib/actions/assessment.ts:
-- {
--   perfectionism, systemsThinking, visionSeeking, purposeOrientation,
--   socialEnergy, emotionalSensitivity, structurePreference, stabilityNeed
-- }

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dimension_scores jsonb;

ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS dimension_scores jsonb;
