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
