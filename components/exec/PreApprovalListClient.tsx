'use client';

import { useMemo, useState } from 'react';
import { addPreApprovedEmail, removePreApprovedEmail } from '@/lib/actions/exec';

interface PreApprovedEmail {
  email: string;
  added_at: string;
  notes: string | null;
}

export default function PreApprovalListClient({ initialEmails }: { initialEmails: PreApprovedEmail[] }) {
  const [emails, setEmails] = useState<PreApprovedEmail[]>(initialEmails);
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const sortedEmails = useMemo(
    () => [...emails].sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime()),
    [emails]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await addPreApprovedEmail(email, notes);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Unable to add pre-approved email.');
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!emails.some((item) => item.email === normalizedEmail)) {
      setEmails((prev) => [
        {
          email: normalizedEmail,
          added_at: new Date().toISOString(),
          notes: notes || null,
        },
        ...prev,
      ]);
    }

    setEmail('');
    setNotes('');
  };

  const handleRemove = async (targetEmail: string) => {
    setError(null);
    setRemovingEmail(targetEmail);

    const result = await removePreApprovedEmail(targetEmail);
    setRemovingEmail(null);

    if (!result.success) {
      setError(result.error || 'Unable to remove pre-approved email.');
      return;
    }

    setEmails((prev) => prev.filter((item) => item.email !== targetEmail));
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[var(--glass-text-muted)] mb-2" htmlFor="preapproved-email">
              Email
            </label>
            <input
              id="preapproved-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-surface-dark)] px-4 py-3 text-sm text-[var(--glass-text-primary)] placeholder-[var(--glass-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--glass-accent)]"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[var(--glass-text-muted)] mb-2" htmlFor="preapproved-notes">
              Notes (optional)
            </label>
            <textarea
              id="preapproved-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why this email is approved"
              className="w-full min-h-[100px] rounded-lg border border-[var(--glass-border)] bg-[var(--glass-surface-dark)] px-4 py-3 text-sm text-[var(--glass-text-primary)] placeholder-[var(--glass-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--glass-accent)]"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="font-mono text-xs uppercase tracking-[0.15em] rounded-full border border-[var(--glass-accent)] px-4 py-2 text-[var(--glass-accent)] hover:bg-[var(--glass-accent-dim)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Adding...' : 'Add to Pre-Approval List'}
            </button>
            {error && <p className="text-xs text-red-500 font-mono">{error}</p>}
          </div>
        </form>
      </div>

      {sortedEmails.length === 0 ? (
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-8 text-center">
          <p className="text-[var(--glass-text-muted)] text-sm">No pre-approved emails yet.</p>
        </div>
      ) : (
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[var(--glass-border)] items-center">
            <span className="font-mono text-xs tracking-[0.15em] text-[var(--glass-text-muted)] uppercase">Email</span>
            <span className="font-mono text-xs tracking-[0.15em] text-[var(--glass-text-muted)] uppercase">Added</span>
            <span className="font-mono text-xs tracking-[0.15em] text-[var(--glass-text-muted)] uppercase">Notes</span>
            <span />
          </div>
          {sortedEmails.map((item, index) => (
            <div
              key={item.email}
              className={`grid grid-cols-[1.4fr_1fr_1fr_auto] gap-4 px-5 py-3 items-center ${
                index < sortedEmails.length - 1 ? 'border-b border-[var(--glass-border)]' : ''
              }`}
            >
              <span className="text-sm text-[var(--glass-text-primary)] truncate">{item.email}</span>
              <span className="text-sm text-[var(--glass-text-muted)] tabular-nums">
                {new Date(item.added_at).toLocaleDateString()}
              </span>
              <span className="text-sm text-[var(--glass-text-primary)] truncate">{item.notes ?? '—'}</span>
              <button
                type="button"
                onClick={() => handleRemove(item.email)}
                disabled={removingEmail === item.email}
                className="font-mono text-xs uppercase tracking-[0.15em] rounded-full border border-red-500 px-3 py-1.5 text-red-500 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {removingEmail === item.email ? 'Removing...' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
