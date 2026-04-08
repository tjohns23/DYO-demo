# Artifact Submission Feature

## Overview

This feature allows users to upload artifacts (screenshots, code files, documents, etc.) as proof of work for completed missions. Artifacts are stored in Supabase Storage with metadata tracked in the database.

## Architecture

### Database Schema
- **artifacts table**: Stores artifact metadata with mission and user FK
  - `id`: UUID (PK)
  - `mission_id`: FK to missions table
  - `user_id`: FK to profiles table
  - `file_name`: Original filename
  - `file_type`: MIME type
  - `file_size`: File size in bytes
  - `file_url`: Public URL in Supabase Storage
  - `verification_status`: 'pending' | 'verified' | 'rejected' (for future expansion)
  - `uploaded_at`: Timestamp
  - `verified_at`: Timestamp (null until verified)
  - `verification_notes`: Optional notes from verification

### Storage Bucket
- **Bucket name**: `mission-artifacts`
- **Access**: Private (RLS enforced)
- **File structure**: `{user_id}/{mission_id}/{timestamp}_{randomSuffix}_{fileName}`

### Row Level Security (RLS)
Users can only:
- View their own artifacts (SELECT policy)
- Upload artifacts to their own folder (INSERT policy)
- Cannot delete artifacts (immutability constraint)

## Components

### ArtifactUploadModal (`components/mission/ArtifactUploadModal.tsx`)
Modal component that handles artifact submission:
- Drag-and-drop file upload
- File type/size validation
- Upload progress indication
- Error handling

**Props:**
- `missionId: string` - ID of the mission to attach artifact to
- `onUploadSuccess: () => void` - Callback when artifact uploads successfully
- `onCancel: () => void` - Callback when user cancels upload

### Server Actions (`lib/actions/mission.ts`)

#### `uploadArtifactAction(missionId: string, file: File)`
Handles artifact upload:
1. Validates mission ownership
2. Uploads file to Supabase Storage
3. Stores artifact metadata in database
4. Returns artifact ID on success

**Returns:**
```typescript
{
  success: boolean;
  artifactId?: string;
  error?: string;
}
```

## User Flow

1. User clicks "I shipped it — mark as done" button in MissionStep3
2. ArtifactUploadModal appears
3. User drags/drops or selects a file
4. Modal validates file type and size
5. File uploads with progress indication
6. On success, mission is automatically marked as completed
7. On error, user can cancel or try again

## File Type Support

**Images:** PNG, JPEG, GIF, WebP
**Documents:** PDF, TXT, Markdown
**Code:** JavaScript, TypeScript, Python, Java, C, C++
**Archives:** ZIP

**Max file size:** 50 MB

## Setup Instructions

### 1. Database Migration
```bash
# Apply the artifacts table migration
supabase db push
```

### 2. Create Storage Bucket

**Option A: Using CLI**
```bash
supabase storage create mission-artifacts --public=false
```

**Option B: Manual Script**
```bash
bash scripts/setup-storage-bucket.sh
```

**Option C: Dashboard**
1. Go to Supabase Dashboard > Storage
2. Click "New bucket"
3. Name: `mission-artifacts`
4. Make it **Private** (not public)
5. Create

### 3. Apply Storage RLS Policies
```bash
# Automatically applied with db push, or manually via:
supabase db push
```

## Testing

### Local Testing
```bash
# Start local Supabase
supabase start

# Run migrations
supabase db push

# Create storage bucket
supabase storage create mission-artifacts --public=false

# Test upload in app
npm run dev
```

### Test Checklist
- [ ] Can upload a valid file (PNG, PDF, etc.)
- [ ] File type validation rejects invalid types
- [ ] File size validation prevents files > 50MB
- [ ] Upload shows progress indicator
- [ ] After successful upload, mission is marked complete
- [ ] Cancel button prevents upload
- [ ] Artifact metadata is stored in database
- [ ] File is accessible in Supabase Storage

## Future Enhancements

### Verification System (Level 4)
- AI-powered verification using Claude API
- Analyze screenshots/code to confirm mission completion
- Set `verification_status` to 'verified' or 'rejected'
- Create admin dashboard to review pending artifacts

### Multiple Artifacts
- Allow users to upload multiple files per mission
- Show thumbnail previews
- Show verification status per file

### Failure Handling
- Retry logic for failed uploads
- Better error messages
- Upload resumption

## Database Queries

### Get artifacts for a mission
```sql
SELECT * FROM artifacts 
WHERE mission_id = $1 
ORDER BY uploaded_at DESC;
```

### Get user's recent artifacts
```sql
SELECT a.* FROM artifacts a
JOIN missions m ON a.mission_id = m.id
WHERE a.user_id = $1
ORDER BY a.uploaded_at DESC
LIMIT 10;
```

### Count unverified artifacts (for admin)
```sql
SELECT COUNT(*) FROM artifacts 
WHERE verification_status = 'pending'
ORDER BY uploaded_at ASC;
```

## Environment Variables

No additional environment variables needed. The feature uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
