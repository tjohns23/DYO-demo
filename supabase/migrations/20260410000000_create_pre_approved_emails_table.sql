-- Create pre_approved_emails table for beta approval whitelist
CREATE TABLE IF NOT EXISTS pre_approved_emails (
  email TEXT PRIMARY KEY,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by TEXT,
  notes TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pre_approved_emails_email ON pre_approved_emails(email);

-- Add comment for documentation
COMMENT ON TABLE pre_approved_emails IS 'Whitelist of email addresses that are automatically approved for beta access';
