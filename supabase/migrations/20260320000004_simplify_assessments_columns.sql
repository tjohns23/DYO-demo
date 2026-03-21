-- Migration: Simplify Assessments Table Columns
-- Purpose: Remove created_at and add calibration_answers column

ALTER TABLE IF EXISTS public.assessments
    DROP COLUMN IF EXISTS created_at CASCADE,
    ADD COLUMN IF NOT EXISTS calibration_answers integer[] NOT NULL DEFAULT '{}';