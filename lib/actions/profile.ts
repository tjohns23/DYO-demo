'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import type { ArchetypeProfile, ArchetypeSlug } from './assessment';
import { ARCHETYPE_METADATA } from '@/lib/config/archetypes';


/**
 * Saves the assessment results to the user's profile after authentication.
 * Called during the magic link callback flow with the authenticated user's info.
 *
 * Persists:
 * - The primary archetype assignment
 * - Raw quiz responses (as an indexed array)
 * - All archetype scores (as JSONB)
 * - Timestamp of completion
 *
 * @param userId  The authenticated user's UUID
 * @param email   The authenticated user's email
 * @param profile The ArchetypeProfile with archetype slug, scores, and responses
 * @returns { success: boolean, error?: string }
 */
export async function saveAssessmentToProfile(
  userId: string,
  email: string,
  profile: ArchetypeProfile
): Promise<{ success: boolean; error?: string }> {
  try {
    // DEBUG: Log what we're about to save
    console.log('saveAssessmentToProfile called with:', {
      userId,
      email,
      slug: profile.slug,
      hasDimensions: !!profile.dimensions,
      dimensions: profile.dimensions,
    });

    // Convert core responses to an ordered array sorted by question ID
    const quizAnswers = [...(profile.responses ?? [])]
      .sort((a, b) => a.questionId - b.questionId)
      .map((r) => r.rating);

    // Convert calibration responses to an ordered array sorted by question ID
    const calibrationAnswers = [...(profile.calibrationResponses ?? [])]
      .sort((a, b) => a.questionId - b.questionId)
      .map((r) => r.value);

    // CRITICAL: Ensure dimensions exist before saving
    if (!profile.dimensions) {
      console.warn('WARNING: profile.dimensions is undefined! Cannot save dimension scores.');
      return { success: false, error: 'Dimensions data is missing from assessment' };
    }

    // Upsert the user profile with archetype slug and assessment data
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: email,
          archetype_slug: profile.slug,
          secondary_archetype_slug: profile.secondary?.slug ?? null,
          tertiary_archetype_slug: profile.tertiary?.slug ?? null,
          quiz_answers: quizAnswers,
          calibration_answers: calibrationAnswers,
          archetype_scores: profile.scores as unknown as Record<string, number>,
          dimension_scores: profile.dimensions as unknown as Record<string, number>,
          assessment_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error('Error saving profile:', profileError);
      return { success: false, error: 'Failed to save profile' };
    }

    console.log('Profile saved successfully with dimensions:', profile.dimensions);

    // Insert the quiz answers into a separate table for analytics
    const { error: answersError } = await supabaseAdmin
      .from('assessments')
      .insert(
        {
          user_id: userId,
          quiz_answers: quizAnswers,
          archetype_scores: profile.scores as unknown as Record<string, number>,
          dimension_scores: profile.dimensions as unknown as Record<string, number>,
          calibration_answers: calibrationAnswers,
          archetype_slug: profile.slug,
          secondary_archetype_slug: profile.secondary?.slug ?? null,
          tertiary_archetype_slug: profile.tertiary?.slug ?? null,
          completed_at: new Date().toISOString(),
        },
      );

    if (answersError) {
      console.error('Error saving quiz answers:', answersError);
      return { success: false, error: 'Failed to save quiz answers' };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error saving assessment:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Fetches the authenticated user's archetype profile.
 * Reads the user_id from the cookie set during the magic link callback.
 *
 * @returns ArchetypeProfile or null if no user cookie or profile exists
 */
export async function getUserArchetypeProfile(): Promise<ArchetypeProfile | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('[getUserArchetypeProfile] auth.getUser():', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      authError: authError?.message,
    });

    if (!user) {
      console.log('[getUserArchetypeProfile] No authenticated user found');
      return null;
    }

    const userId = user.id;

    // Fetch the user's profile with assessment data
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(
        `
        id,
        email,
        archetype_slug,
        quiz_answers,
        calibration_answers,
        archetype_scores
      `
      )
      .eq('id', userId)
      .single();

    console.log('[getUserArchetypeProfile] DB query result:', {
      hasData: !!data,
      archetypeSlug: data?.archetype_slug,
      dbError: error?.message,
    });

    if (error) {
      console.error('[getUserArchetypeProfile] Error fetching profile:', error);
      return null;
    }

    if (!data || !data.archetype_slug) {
      console.log('[getUserArchetypeProfile] No profile or archetype data found');
      return null;
    }

    const archetypeSlug = data.archetype_slug as ArchetypeSlug;

    const metadata = ARCHETYPE_METADATA[archetypeSlug];

    if (!metadata) {
      console.error('No metadata for archetype:', archetypeSlug);
      return null;
    }

    // Reconstruct archetype scores if available, otherwise use zeros
    let scores = {
      optimizer: 0,
      strategist: 0,
      visionary: 0,
      advocate: 0,
      politician: 0,
      empath: 0,
      builder: 0,
      stabilizer: 0,
    };

    if (data.archetype_scores && typeof data.archetype_scores === 'object') {
      scores = { ...scores, ...data.archetype_scores };
    }

    // Reconstruct responses if available
    let responses: ArchetypeProfile['responses'] = undefined;
    if (Array.isArray(data.quiz_answers)) {
      responses = data.quiz_answers
        .map((rating: number | null, index: number) => ({
          questionId: index + 1,
          rating: rating || 0,
        }))
        .filter((r: { questionId: number; rating: number }) => r.rating > 0);
    }

    return {
      slug: archetypeSlug,
      name: metadata.name,
      tagline: metadata.tagline,
      description: metadata.description,
      scores,
      responses,
    };
  } catch (err) {
    console.error('Unexpected error fetching user archetype:', err);
    return null;
  }
}

/**
 * Fetches just the archetype name and slug for the current user.
 * Lightweight helper for UI components that need archetype display info.
 *
 * @returns Object with { slug, name } or null if no user/profile
 */
export async function getUserArchetypeInfo(): Promise<{
  slug: ArchetypeSlug;
  name: string;
} | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const userId = user.id;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('archetype_slug')
      .eq('id', userId)
      .single();

    if (error || !data || !data.archetype_slug) {
      return null;
    }

    const slug = data.archetype_slug as ArchetypeSlug;
    const metadata = ARCHETYPE_METADATA[slug];

    if (!metadata) {
      return null;
    }

    return {
      slug,
      name: metadata.name,
    };
  } catch (err) {
    console.error('Error fetching archetype info:', err);
    return null;
  }
}
