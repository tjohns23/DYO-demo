# DYO Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Configuration
- [ ] Copy `.env.example` to `.env.local` or `.env.production`
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` from your Supabase project dashboard
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project dashboard
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` (keep this secret, never commit)
- [ ] (Optional) Set `GOOGLE_GENERATIVE_AI_API_KEY` for Gemini integration
- [ ] (Optional) Set `GEMINI_MODEL` (defaults to `gemini-2.0-flash`)

### 2. Database Setup
- [ ] Create new Supabase project or use existing
- [ ] Run database migrations: `supabase db push`
- [ ] Verify all migrations applied successfully
- [ ] Check that RLS policies are enabled on all tables:
  - [ ] `profiles` table - RLS enabled with SELECT/UPDATE policies
  - [ ] `assessments` table - RLS enabled
  - [ ] `missions` table - RLS enabled
  - [ ] `artifacts` table - RLS enabled

### 3. Storage Configuration
- [ ] Create `mission-artifacts` storage bucket (private, not public)
  ```bash
  supabase storage create mission-artifacts --public=false
  ```
- [ ] Verify storage bucket RLS policies are applied
- [ ] Test artifact upload capability

### 4. Authentication
- [ ] Verify Supabase Auth is enabled
- [ ] Configure your email provider (Supabase Auth Email)
- [ ] Test magic link flow with a test email account
- [ ] Verify session cookies are being set correctly

### 5. Application Build & Testing
- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run typecheck` to verify TypeScript compilation
- [ ] Run `npm run lint` to check for lint errors
- [ ] Run `npm run build` to create production build
- [ ] Test locally: `npm run start` and verify app loads

### 6. Feature Testing

#### Assessment Quiz
- [ ] Quiz displays correctly on home page
- [ ] Quiz scoring calculates properly
- [ ] Archetype profile displays after assessment
- [ ] Assessment data saved to database

#### Magic Link Authentication
- [ ] User receives magic link email
- [ ] Magic link correctly authenticates user
- [ ] Redirect to `/dashboard` or `/waitlist` works
- [ ] User can view their profile after auth

#### Mission Generation
- [ ] User can enter work description
- [ ] Mission generates successfully
- [ ] Mission displays with proper formatting
- [ ] User can accept/reject mission
- [ ] Mission timer works correctly
- [ ] Mission can be marked as completed or expired

#### Artifact Upload
- [ ] User can upload artifact file
- [ ] File is stored in Supabase Storage
- [ ] Artifact metadata saved to database
- [ ] User can view uploaded artifacts

#### Dashboard
- [ ] Stats display correctly (completion rate, streaks, etc.)
- [ ] History table loads and paginates
- [ ] Charts render without errors
- [ ] Active mission banner displays when mission active

### 7. Error Handling & Edge Cases
- [ ] Test with missing Gemini API key (should fallback to library)
- [ ] Test network error handling
- [ ] Test with expired auth token
- [ ] Test unauthenticated user access (redirects correctly)
- [ ] Test RLS violations (users can't access other users' data)

### 8. Security Verification
- [ ] No sensitive data in console logs
- [ ] Cookies have `httpOnly` and `sameSite` flags
- [ ] RLS policies prevent unauthorized access
- [ ] Service role key never exposed to client
- [ ] All env vars properly configured

### 9. Performance Checks
- [ ] Initial page load time acceptable
- [ ] Dashboard queries perform efficiently
- [ ] No N+1 database queries
- [ ] Asset caching working (fonts, CSS, JS)

### 10. Final Checks
- [ ] README.md is up to date
- [ ] All TODOs and FIXMEs resolved
- [ ] No broken imports or unused dependencies
- [ ] Build succeeds without warnings
- [ ] All env vars documented in `.env.example`

## Automated Setup Script

Run the deployment setup script to automate most setup steps:

```bash
chmod +x scripts/deploy-setup.sh
./scripts/deploy-setup.sh
```

The script will:
1. Check for required tools (Supabase CLI, Node.js)
2. Verify environment variables are set
3. Create the storage bucket
4. Run database migrations
5. Run type checking
6. Build the application

## Common Issues & Solutions

### "RLS violates..." Error
- Check that all table migrations include RLS enable statements
- Verify policies are created correctly in migrations
- Ensure `profiles` table has RLS policies (migration: `20260409000001_enable_rls_on_profiles.sql`)

### Storage Bucket Error
- Ensure bucket was created with: `supabase storage create mission-artifacts --public=false`
- Check storage RLS policies in migration: `20260407000001_storage_bucket_rls.sql`

### Gemini Generation Fails
- If `GOOGLE_GENERATIVE_AI_API_KEY` not set, app falls back to library-based generation
- Check Gemini API key is valid and has necessary permissions
- Verify model name is correct (default: `gemini-2.0-flash`)

### Auth Cookie Issues
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and keys are correct
- Clear browser cookies and test again
- Check middleware.ts is properly configured

## Rollback Plan

If deployment issues occur:

1. **Database Issues**: Roll back migrations
   ```bash
   supabase db pull  # Get current state
   # Fix issues in migration files
   supabase db push  # Reapply
   ```

2. **Code Issues**: Revert last commit
   ```bash
   git revert HEAD
   git push
   ```

3. **Environment Issues**: Verify all env vars are set correctly

## Support

For issues or questions, refer to:
- [DYO Project Documentation](claude.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
