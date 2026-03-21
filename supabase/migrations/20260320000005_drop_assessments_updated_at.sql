-- Migration: Drop updated_at column from assessments table
-- Purpose: Remove the updated_at column as it's not needed for our use case

ALTER TABLE IF EXISTS public.assessments
    DROP COLUMN IF EXISTS updated_at CASCADE;
