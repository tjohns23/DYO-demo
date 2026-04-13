import { getWaitlistUsers } from '@/lib/actions/exec';
import ApproveButton from '@/app/exec/ApproveButton';

export default async function WaitlistTab() {
  const waitlist = await getWaitlistUsers();

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h1 className="font-mono text-xs tracking-[0.2em] text-[var(--glass-text-muted)] uppercase mb-1">Executive Suite</h1>
        <p className="text-2xl font-semibold text-[var(--glass-text-primary)]">Waitlist Management</p>
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
  );
}
