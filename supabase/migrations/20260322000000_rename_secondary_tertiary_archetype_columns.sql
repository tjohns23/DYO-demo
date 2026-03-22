-- Migration: rename_secondary_tertiary_archetype_columns
-- Created: 2026-03-22

-- Description:
-- Renames secondary_archetype and tertiary_archetype to secondary_archetype_slug
-- and tertiary_archetype_slug in profiles for naming consistency with archetype_slug.
-- Also adds archetype slug columns to assessments for analytics.

ALTER TABLE public.profiles
    RENAME COLUMN secondary_archetype TO secondary_archetype_slug;

ALTER TABLE public.profiles
    RENAME COLUMN tertiary_archetype TO tertiary_archetype_slug;

ALTER TABLE public.assessments
    ADD COLUMN IF NOT EXISTS archetype_slug VARCHAR(255),
    ADD COLUMN IF NOT EXISTS secondary_archetype_slug VARCHAR(255),
    ADD COLUMN IF NOT EXISTS tertiary_archetype_slug VARCHAR(255);
