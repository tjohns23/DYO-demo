-- Add calibration_answers column to profiles table
-- Stores responses to calibration questions (Q21-Q25) as JSONB
-- Example: { "0": "adhd_none", "1": "autism_suspected", "2": 4, "3": "learning_visual_diagrams", "4": "obstacle_perfectionism" }

ALTER TABLE profiles ADD COLUMN calibration_answers JSONB DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN profiles.calibration_answers IS 'Calibration responses (Q21-Q25) stored as JSONB. Keys are 0-4 (offset from Q21), values are mixed string/number types.';
