-- Enable RLS on pre_approved_emails table
ALTER TABLE pre_approved_emails ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read (for the system to check during signup)
CREATE POLICY "Allow authenticated to read pre_approved_emails"
  ON pre_approved_emails
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow exec users to manage the list
CREATE POLICY "Allow exec users to manage pre_approved_emails"
  ON pre_approved_emails
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_exec = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_exec = true
    )
  );
