-- Migration: Add Archetype Metadata Columns
-- Purpose: Add slug, name, and tagline columns to support ArchetypeProfile queries

ALTER TABLE IF EXISTS public.archetypes
  ADD COLUMN IF NOT EXISTS slug text UNIQUE NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tagline text NOT NULL DEFAULT '';

-- Remove defaults after adding (these were just for existing rows)
ALTER TABLE IF EXISTS public.archetypes
  ALTER COLUMN slug DROP DEFAULT,
  ALTER COLUMN name DROP DEFAULT,
  ALTER COLUMN tagline DROP DEFAULT;

-- Populate slug values based on title if needed
-- (This assumes title matches one of the standard archetype names)
UPDATE public.archetypes
  SET slug = CASE 
    WHEN title ILIKE '%perfectionist%' THEN 'perfectionist'
    WHEN title ILIKE '%avoider%' THEN 'avoider'
    WHEN title ILIKE '%overthinker%' THEN 'overthinker'
    WHEN title ILIKE '%scope%creep%' OR title ILIKE '%creep%' THEN 'scope_creeper'
    ELSE LOWER(REPLACE(title, ' ', '_'))
  END,
  name = title
WHERE slug = '' OR name = '';

-- Documentation:
-- slug: Unique identifier used for queries (e.g., 'perfectionist', 'avoider')
-- name: Display name (e.g., "The Perfectionist")
-- tagline: One-line supportive message (e.g., "You're wired for excellence — and it's keeping you stuck.")
-- strategy_hint: Strategy recommendation (existing column, preserved)
