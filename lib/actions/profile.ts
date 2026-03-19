'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { ArchetypeProfile } from './assessment';
import { cookies } from 'next/headers';

/**
 * Saves the assessment scores to the user's profile after authentication.
 * Called during the magic link callback flow with the authenticated user's info.
 *
 * @param userId  The authenticated user's UUID
 * @param email   The authenticated user's email
 * @param profile The ArchetypeProfile with scores and archetype slug
 * @returns { success: boolean, error?: string }
 */
export async function saveAssessmentToProfile(
  userId: string,
  email: string,
  profile: ArchetypeProfile
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch the archetype ID from the slug
    const { data: archetypeData, error: archetypeError } = await supabaseAdmin
      .from('archetypes')
      .select('id')
      .eq('slug', profile.slug)
      .single();

    if (archetypeError || !archetypeData) {
      console.error('Error fetching archetype:', archetypeError);
      return { success: false, error: 'Archetype not found' };
    }

    // Upsert the user profile with assessment scores
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: email,
          archetype_id: archetypeData.id,
          perfectionism_score: profile.scores.perfectionism,
          avoidance_score: profile.scores.avoidance,
          overthinking_score: profile.scores.overthinking,
          scope_creep_score: profile.scores.scopeCreep,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error('Error saving profile:', profileError);
      return { success: false, error: 'Failed to save profile' };
    }

    // Set the user_id cookie so server components can identify the user
    const cookieStore = await cookies();
    cookieStore.set('user_id', userId, { httpOnly: true, path: '/', sameSite: 'lax' });

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
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      console.log('No user_id cookie found');
      return null;
    }

    // Fetch the user's profile with archetype data
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(
        `
        id,
        email,
        perfectionism_score,
        avoidance_score,
        overthinking_score,
        scope_creep_score,
        archetypes(slug, name, tagline, description)
      `
      )
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!data || !data.archetypes) {
      console.log('No profile or archetype data found');
      return null;
    }

    // Map to ArchetypeProfile format
    type ArchetypeRow = { slug: string; name: string; tagline: string; description: string };
    const archetype = (
      Array.isArray(data.archetypes) ? data.archetypes[0] : data.archetypes
    ) as ArchetypeRow;
    return {
      slug: archetype.slug as ArchetypeProfile['slug'],
      name: archetype.name,
      tagline: archetype.tagline,
      description: archetype.description,
      scores: {
        perfectionism: data.perfectionism_score || 0,
        avoidance: data.avoidance_score || 0,
        overthinking: data.overthinking_score || 0,
        scopeCreep: data.scope_creep_score || 0,
      },
    };
  } catch (err) {
    console.error('Unexpected error fetching user archetype:', err);
    return null;
  }
}
