-- Update the generated_by check constraint to include 'claude'
-- This was added when Claude was set as the default mission generator
ALTER TABLE missions
  DROP CONSTRAINT missions_generated_by_check;

ALTER TABLE missions
  ADD CONSTRAINT missions_generated_by_check
    CHECK (generated_by IN ('gemini', 'claude', 'library'));
