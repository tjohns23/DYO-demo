-- Storage Bucket RLS Policies for mission-artifacts
-- 
-- IMPORTANT: Before running this migration, manually create the storage bucket:
-- 1. Via Supabase CLI:
--    supabase storage create mission-artifacts --public=false
-- 
-- 2. Or via Supabase Dashboard:
--    Storage > New bucket > Name: "mission-artifacts" > Private (not public)
--
-- This migration sets up Row Level Security policies for the bucket.

-- Policy: Users can view their own artifacts
CREATE POLICY "Users can view their own artifacts"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'mission-artifacts' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Policy: Users can upload their own artifacts  
CREATE POLICY "Users can upload their own artifacts"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'mission-artifacts' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Policy: Users cannot delete their own artifacts (immutability)
CREATE POLICY "Prevent artifact deletion"
  ON storage.objects
  FOR DELETE
  USING (false);
