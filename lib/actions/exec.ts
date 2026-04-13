'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function approveUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ beta_approved: true })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/exec');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return { success: false, error: message };
  }
}

export async function getWaitlistUsers(): Promise<Array<{ id: string; email: string; created_at: string }>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, created_at')
      .or('beta_approved.is.null,beta_approved.eq.false')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching waitlist users:', error.message);
      return [];
    }
    
    // Filter out any rows with null created_at and cast to expected type
    return (data ?? []).filter((row): row is { id: string; email: string; created_at: string } => {
      return row.created_at !== null;
    });
  } catch (err) {
    console.error('Error fetching waitlist users:', err);
    return [];
  }
}

export async function addPreApprovedEmail(email: string, notes?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Invalid email address' };
    }

    const { error } = await supabaseAdmin
      .from('pre_approved_emails')
      .insert({
        email: normalizedEmail,
        notes: notes || null,
      });

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'This email is already pre-approved' };
      }
      return { success: false, error: error.message };
    }

    revalidatePath('/exec');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return { success: false, error: message };
  }
}

export async function removePreApprovedEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    const { error } = await supabaseAdmin
      .from('pre_approved_emails')
      .delete()
      .eq('email', normalizedEmail);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/exec');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return { success: false, error: message };
  }
}

export async function getPreApprovedEmails(): Promise<Array<{ email: string; added_at: string; notes: string | null }>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('pre_approved_emails')
      .select('email, added_at, notes')
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching pre-approved emails:', error.message);
      return [];
    }

    return (data ?? []).filter((row): row is { email: string; added_at: string; notes: string | null } => {
      return row.email !== null && row.added_at !== null;
    });
  } catch (err) {
    console.error('Error fetching pre-approved emails:', err);
    return [];
  }
}

export interface UserWithMissions {
  id: string;
  email: string;
  created_at: string;
  beta_approved: boolean;
  archetype_slug: string | null;
  missions: Array<{
    id: string;
    status: string;
    mode: string;
    pattern: string;
    work_type: string;
    timebox: number;
    framing: string;
    scope: string;
    completion: string;
    constraint_rule: string;
    created_at: string;
    accepted_at: string | null;
    completed_at: string | null;
    time_to_completion: number | null;
  }>;
}

export async function searchUserByEmail(email: string): Promise<{ success: boolean; user?: UserWithMissions; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { success: false, error: 'Invalid email address' };
    }

    // Search for user in profiles
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, created_at, beta_approved, archetype_slug')
      .eq('email', normalizedEmail)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return { success: false, error: 'User not found' };
      }
      return { success: false, error: userError.message };
    }

    // Get user's missions
    const { data: missionsData, error: missionsError } = await supabaseAdmin
      .from('missions')
      .select(
        'id, status, mode, pattern, work_type, timebox, framing, scope, completion, constraint_rule, created_at, accepted_at, completed_at, time_to_completion'
      )
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    if (missionsError) {
      console.error('Error fetching missions:', missionsError.message);
      return { success: false, error: 'Failed to fetch user missions' };
    }

    return {
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        created_at: userData.created_at || new Date().toISOString(),
        beta_approved: userData.beta_approved || false,
        archetype_slug: userData.archetype_slug,
        missions: (missionsData ?? []).map(m => ({
          id: m.id,
          status: m.status,
          mode: m.mode,
          pattern: m.pattern,
          work_type: m.work_type,
          timebox: m.timebox,
          framing: m.framing,
          scope: m.scope,
          completion: m.completion,
          constraint_rule: m.constraint_rule,
          created_at: m.created_at,
          accepted_at: m.accepted_at,
          completed_at: m.completed_at,
          time_to_completion: m.time_to_completion,
        })),
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return { success: false, error: message };
  }
}

export async function toggleMissionComplete(
  missionId: string,
  isComplete: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: {
      status: 'completed' | 'accepted';
      completed_at: string | null;
      time_to_completion: number | null;
    } = {
      status: isComplete ? 'completed' : 'accepted',
      completed_at: isComplete ? new Date().toISOString() : null,
      time_to_completion: isComplete ? 0 : null,
    };

    const { error } = await supabaseAdmin
      .from('missions')
      .update(updates)
      .eq('id', missionId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/exec');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return { success: false, error: message };
  }
}
