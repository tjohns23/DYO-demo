ALTER TABLE assessments
  ALTER COLUMN calibration_answers DROP DEFAULT;

ALTER TABLE assessments
  ALTER COLUMN calibration_answers TYPE jsonb
  USING to_jsonb(calibration_answers);

ALTER TABLE assessments
  ALTER COLUMN calibration_answers SET DEFAULT '[]'::jsonb;
