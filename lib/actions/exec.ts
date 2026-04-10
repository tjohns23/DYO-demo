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
