-- Migration: migration_description
-- Created: 2026-03-21

-- Description: 
-- This migration adds a secondary and tertiary archetype to profiles table

ALTER TABLE IF EXISTS public.profiles
    ADD COLUMN IF NOT EXISTS secondary_archetype VARCHAR(255),
    ADD COLUMN IF NOT EXISTS tertiary_archetype VARCHAR(255);
