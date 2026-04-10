import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getWaitlistUsers } from '@/lib/actions/exec';
import NavHeader from '@/components/NavHeader';
import ApproveButton from './ApproveButton';

export default async function ExecPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_exec')
    .eq('id', user.id)
    .single();

  if (!profile?.is_exec) redirect('/dashboard');

  const waitlist = await getWaitlistUsers();

  return (
    <div
      className="min-h-screen bg-background"
      style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(120,20,50,0.25) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 80% 100%, rgba(80,10,30,0.2) 0%, transparent 60%)' }}
    >
      <NavHeader activePage="exec" isExec={true} />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-mono text-xs tracking-[0.2em] text-[var(--glass-text-muted)] uppercase mb-1">Executive Panel</h1>
          <p className="text-2xl font-semibold text-[var(--glass-text-primary)]">Waitlist</p>
        </div>

        {waitlist.length === 0 ? (
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-8 text-center">
            <p className="text-[var(--glass-text-muted)] text-sm">No users waiting for approval.</p>
          </div>
        ) : (
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl overflow-hidden">
            <div className="border-b border-[var(--glass-border)] px-5 py-3 grid grid-cols-[1fr_auto_auto] gap-4 items-center">
              <span className="font-mono text-xs tracking-[0.15em] text-[var(--glass-text-muted)] uppercase">Email</span>
              <span className="font-mono text-xs tracking-[0.15em] text-[var(--glass-text-muted)] uppercase">Joined</span>
              <span />
            </div>
            {waitlist.map((u, i) => (
              <div
                key={u.id}
                className={`px-5 py-3.5 grid grid-cols-[1fr_auto_auto] gap-4 items-center${i < waitlist.length - 1 ? ' border-b border-[var(--glass-border)]' : ''}`}
              >
                <span className="text-sm text-[var(--glass-text-primary)] truncate">{u.email}</span>
                <span className="text-sm text-[var(--glass-text-muted)] tabular-nums">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                </span>
                <ApproveButton userId={u.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
