'use server';

import { cookies } from 'next/headers';
import { generateMission, type Mission, type UserProfile } from '@/lib/mission/missionEngine';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { ArchetypeSlug } from './assessment';

/**
 * Generates a mission for the current authenticated user.
 * Server action that:
 * - Fetches the user from cookies
 * - Retrieves their archetype and profile data
 * - Calls the mission engine to generate a personalized mission
 * - Returns the generated mission
 *
 * @param workDescription The user's description of what they're working on
 * @returns The generated Mission object or an error
 */
export async function generateMissionAction(
  workDescription: string
): Promise<{
  success: boolean;
  mission?: Mission;
  error?: string;
}> {
  try {
    // Get authenticated user from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return { success: false, error: 'User not authenticated. Please log in first.' };
    }

    // Fetch user's archetype profile from database
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, archetype_slug')
      .eq('id', userId)
      .single();

    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      return { success: false, error: 'Failed to fetch user profile. Please complete the assessment first.' };
    }

    const primaryArchetype = profileData.archetype_slug as ArchetypeSlug;

    if (!primaryArchetype) {
      return { success: false, error: 'User archetype not set. Please complete the assessment.' };
    }

    // Build user profile for mission engine
    const userProfile: UserProfile = {
      userId,
      primaryArchetype,
      workDescription,
    };

    // Generate mission using the mission engine
    const mission = await generateMission(userProfile);

    // Return the generated mission without saving to database yet.
    // Mission will be saved when user explicitly accepts it in acceptMissionAction.
    return { success: true, mission };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Accepts a mission by persisting it to the database with status 'accepted'.
 * Mission data is provided by the client to ensure the full mission object is saved.
 */
export async function acceptMissionAction(
  missionId: string,
  mission: Mission,
  acceptedAt: string,
  workDescription: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) return { success: false, error: 'User not authenticated.' };

    // Insert the mission to database with status 'accepted' when user accepts it
    const { error: insertError } = await supabaseAdmin
      .from('missions')
      .insert({
        id: mission.missionId,
        user_id: mission.userId,
        status: 'accepted',
        mode: mission.mode,
        pattern: mission.pattern,
        framing: mission.framing,
        scope: mission.scope,
        constraint_rule: mission.constraintRule,
        completion: mission.completion,
        timebox: mission.timebox,
        generated_by: mission.generatedBy,
        constraint_id: mission.constraintId,
        archetype: mission.archetype,
        work_type: mission.workType,
        work_description: workDescription,
        accepted_at: acceptedAt,
      });

    if (insertError) {
      return { success: false, error: 'Failed to accept mission. Please try again.' };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('[MissionAction] Error accepting mission:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Returns the user's current accepted mission, if one exists.
 * Used to resume a mission after a page reload or tab close.
 */
export async function getActiveMissionAction(): Promise<{
  success: boolean;
  mission?: {
    missionId: string;
    description: string;
    pattern: string;
    patternDetected: boolean;
    framing: string;
    timebox: number;
    scope: string;
    completion: string;
    constraint: string;
    acceptedAt: string;
    thoughtParking?: string;
  };
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) return { success: false, error: 'User not authenticated.' };

    const { data, error } = await supabaseAdmin
      .from('missions')
      .select('id, work_description, pattern, framing, timebox, scope, completion, constraint_rule, accepted_at, thought_parking')
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .order('accepted_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return { success: true }; // no active mission is not an error

    return {
      success: true,
      mission: {
        missionId: data.id,
        description: data.work_description,
        pattern: data.pattern,
        patternDetected: !!data.framing,
        framing: data.framing ?? '',
        timebox: data.timebox,
        scope: data.scope,
        completion: data.completion,
        constraint: data.constraint_rule,
        acceptedAt: data.accepted_at as string,
        thoughtParking: data.thought_parking ?? undefined,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Persists the user's thought parking notes for an active mission.
 */
export async function saveThoughtParkingAction(
  missionId: string,
  thoughts: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) return { success: false, error: 'User not authenticated.' };

    const { error } = await supabaseAdmin
      .from('missions')
      .update({ thought_parking: thoughts })
      .eq('id', missionId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: 'Failed to save thoughts.' };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Marks an accepted mission as completed and records elapsed time.
 */
export async function completeMissionAction(
  missionId: string,
  secondsElapsed: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) return { success: false, error: 'User not authenticated.' };

    const { error, data, status } = await supabaseAdmin
      .from('missions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        time_to_completion: secondsElapsed,
      })
      .eq('id', missionId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error?.message || 'Failed to complete mission.' };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}

export type MissionStats = {
  totalGenerated: number;
  totalCompleted: number;
  totalExpired: number;
  completionRate: number;
  averageCompletionTimeMinutes: number | null;
  currentStreak: number;
  commonPatterns: { name: string; total: number; completionRate: number }[];
  weeklyBreakdown: { date: string; completed: number; expired: number }[];
};

export type MissionHistoryItem = {
  id: string;
  pattern: string;
  status: string;
  timebox: number;
  scope: string;
  created_at: string;
  time_to_completion: number | null;
};

/**
 * Computes dashboard statistics for the current user using targeted aggregate queries.
 */
export async function getMissionStatsAction(): Promise<{
  success: boolean;
  stats?: MissionStats;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) return { success: false, error: 'User not authenticated.' };

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      totalResult,
      completedResult,
      expiredResult,
      timesResult,
      streakResult,
      patternResult,
      weeklyResult,
    ] = await Promise.all([
      supabaseAdmin.from('missions').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabaseAdmin.from('missions').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed'),
      supabaseAdmin.from('missions').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'expired'),
      supabaseAdmin.from('missions').select('time_to_completion').eq('user_id', userId).eq('status', 'completed').not('time_to_completion', 'is', null),
      supabaseAdmin.from('missions').select('status').eq('user_id', userId).in('status', ['completed', 'expired']).order('created_at', { ascending: false }).limit(30),
      supabaseAdmin.from('missions').select('pattern, status').eq('user_id', userId),
      supabaseAdmin.from('missions').select('created_at, status').eq('user_id', userId).gte('created_at', sevenDaysAgo).in('status', ['completed', 'expired']),
    ]);

    const totalGenerated = totalResult.count ?? 0;
    const totalCompleted = completedResult.count ?? 0;
    const totalExpired = expiredResult.count ?? 0;
    const completionRate = (totalCompleted + totalExpired) > 0
      ? Math.round((totalCompleted / (totalCompleted + totalExpired)) * 100)
      : 0;

    // Average completion time in minutes
    const times = (timesResult.data ?? []).map(r => r.time_to_completion as number);
    const averageCompletionTimeMinutes = times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length / 60)
      : null;

    // Streak: consecutive completed missions from most recent
    const streak = (streakResult.data ?? []).reduce((count, row) => {
      if (count === -1) return -1; // already broken
      if (row.status === 'completed') return count + 1;
      return -1; // expired breaks streak, use sentinel
    }, 0);
    const currentStreak = streak === -1 ? 0 : streak;

    // Common patterns: group by pattern, compute per-pattern completion rate
    const patternMap = new Map<string, { total: number; completed: number }>();
    for (const row of (patternResult.data ?? [])) {
      const entry = patternMap.get(row.pattern) ?? { total: 0, completed: 0 };
      entry.total++;
      if (row.status === 'completed') entry.completed++;
      patternMap.set(row.pattern, entry);
    }
    const commonPatterns = [...patternMap.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 4)
      .map(([name, { total, completed }]) => ({
        name,
        total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      }));

    // Weekly breakdown: last 7 days, one entry per day
    const dayMap = new Map<string, { completed: number; expired: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      dayMap.set(key, { completed: 0, expired: 0 });
    }
    for (const row of (weeklyResult.data ?? [])) {
      const key = new Date(row.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      const entry = dayMap.get(key);
      if (entry) {
        if (row.status === 'completed') entry.completed++;
        else if (row.status === 'expired') entry.expired++;
      }
    }
    const weeklyBreakdown = [...dayMap.entries()].map(([date, counts]) => ({ date, ...counts }));

    return {
      success: true,
      stats: {
        totalGenerated,
        totalCompleted,
        totalExpired,
        completionRate,
        averageCompletionTimeMinutes,
        currentStreak,
        commonPatterns,
        weeklyBreakdown,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Returns the most recent 10 missions for the history list, paginated.
 */
export async function getMissionHistoryAction(page = 0): Promise<{
  success: boolean;
  missions?: MissionHistoryItem[];
  error?: string;
}> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) return { success: false, error: 'User not authenticated.' };

    const { data, error } = await supabaseAdmin
      .from('missions')
      .select('id, pattern, status, timebox, scope, created_at, time_to_completion')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * 10, page * 10 + 9);

    if (error) {
      return { success: false, error: 'Failed to fetch mission history.' };
    }

    return { success: true, missions: (data ?? []) as MissionHistoryItem[] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Marks a mission as expired when the timer runs out.
 */
export async function expireMissionAction(
  missionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) return { success: false, error: 'User not authenticated.' };

    const { error } = await supabaseAdmin
      .from('missions')
      .update({ status: 'expired', expired_at: new Date().toISOString() })
      .eq('id', missionId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error?.message || 'Failed to expire mission.' };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Uploads an artifact file for a mission and stores metadata in the database.
 * Handles:
 * - File upload to Supabase Storage (mission-artifacts bucket)
 * - Artifact metadata insertion into artifacts table
 * - RLS enforced: users can only upload for their own missions
 */
export async function uploadArtifactAction(
  missionId: string,
  file: File
): Promise<{ success: boolean; artifactId?: string; error?: string }> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) return { success: false, error: 'User not authenticated.' };

    // Validate mission ownership
    const { data: mission, error: missionError } = await supabaseAdmin
      .from('missions')
      .select('id, user_id')
      .eq('id', missionId)
      .eq('user_id', userId)
      .single();

    if (missionError || !mission) {
      return { success: false, error: 'Mission not found or unauthorized.' };
    }

    // Generate unique file path
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${missionId}/${timestamp}_${randomSuffix}_${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('mission-artifacts')
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    if (!uploadData) {
      return { success: false, error: 'Upload failed: No response from storage.' };
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('mission-artifacts')
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    // Insert artifact metadata into database
    const { data: artifact, error: insertError } = await supabaseAdmin
      .from('artifacts')
      .insert({
        mission_id: missionId,
        user_id: userId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: fileUrl,
        verification_status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: 'Failed to save artifact metadata.' };
    }

    return { success: true, artifactId: artifact.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: errorMessage };
  }
}
