-- Migration: dimension_scores_not_null
-- Created: 2026-03-22

-- Description:
-- Makes dimension_scores NOT NULL on both profiles and assessments.
-- Existing rows with no dimension data are backfilled with an empty object
-- so the constraint can be applied without error.

UPDATE public.profiles
  SET dimension_scores = '{}'::jsonb
  WHERE dimension_scores IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN dimension_scores SET NOT NULL;

UPDATE public.assessments
  SET dimension_scores = '{}'::jsonb
  WHERE dimension_scores IS NULL;

ALTER TABLE public.assessments
  ALTER COLUMN dimension_scores SET NOT NULL;
