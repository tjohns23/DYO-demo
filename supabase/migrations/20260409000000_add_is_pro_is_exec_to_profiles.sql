-- Add is_pro and is_exec flags to profiles
-- is_pro: paid/pro tier users
-- is_exec: executive tier users

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_pro  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_exec BOOLEAN NOT NULL DEFAULT FALSE;
