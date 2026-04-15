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
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

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
    setShowAddForm(false);
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
    if (expandedEmail === targetEmail) {
      setExpandedEmail(null);
    }
  };

  const handleEdit = (targetEmail: string, currentNotes: string | null) => {
    setEditingEmail(targetEmail);
    setEditNotes(currentNotes || '');
    setExpandedEmail(targetEmail);
  };

  const handleSaveEdit = async () => {
    if (!editingEmail) return;

    setError(null);
    setLoading(true);

    // Remove the old entry and add the new one with updated notes
    const oldEntry = emails.find(e => e.email === editingEmail);
    if (!oldEntry) return;

    const removeResult = await removePreApprovedEmail(editingEmail);
    if (!removeResult.success) {
      setError(removeResult.error || 'Unable to update email.');
      setLoading(false);
      return;
    }

    const addResult = await addPreApprovedEmail(editingEmail, editNotes);
    setLoading(false);

    if (!addResult.success) {
      setError(addResult.error || 'Unable to update email.');
      // Try to restore the old entry
      setEmails(prev => [...prev, oldEntry]);
      return;
    }

    setEmails((prev) => prev.map((item) =>
      item.email === editingEmail
        ? { ...item, notes: editNotes || null }
        : item
    ));

    setEditingEmail(null);
    setEditNotes('');
  };

  const handleCancelEdit = () => {
    setEditingEmail(null);
    setEditNotes('');
  };

  const toggleExpanded = (email: string) => {
    setExpandedEmail(expandedEmail === email ? null : email);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs tracking-[0.15em] text-[var(--glass-text-muted)] uppercase">
          Pre-Approved Emails ({sortedEmails.length})
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="font-mono text-xs uppercase tracking-[0.15em] rounded-full border border-[var(--glass-accent)] px-4 py-2 text-[var(--glass-accent)] hover:bg-[var(--glass-accent-dim)] transition-all"
        >
          {showAddForm ? 'Cancel' : '+ Add Email'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
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
      )}

      {/* Accordion List */}
      {sortedEmails.length === 0 ? (
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-8 text-center">
          <p className="text-[var(--glass-text-muted)] text-sm">No pre-approved emails yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEmails.map((item) => (
            <div
              key={item.email}
              className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleExpanded(item.email)}
                className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-[var(--glass-surface-dark)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`transform transition-transform ${expandedEmail === item.email ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                  <span className="text-sm font-semibold text-[var(--glass-text-primary)]">{item.email}</span>
                  <span className="text-xs text-[var(--glass-text-muted)] tabular-nums">
                    Added {new Date(item.added_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(item.email, item.notes);
                    }}
                    className="font-mono text-xs px-3 py-1.5 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-500/10 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.email);
                    }}
                    disabled={removingEmail === item.email}
                    className="font-mono text-xs px-3 py-1.5 rounded-full border border-red-500 text-red-500 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {removingEmail === item.email ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </button>

              {/* Accordion Content */}
              {expandedEmail === item.email && (
                <div className="px-5 pb-4 border-t border-[var(--glass-border)]">
                  {editingEmail === item.email ? (
                    <div className="pt-4 space-y-3">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[var(--glass-text-muted)] mb-2">
                          Notes
                        </label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Why this email is approved"
                          className="w-full min-h-[80px] rounded-lg border border-[var(--glass-border)] bg-[var(--glass-surface-dark)] px-4 py-3 text-sm text-[var(--glass-text-primary)] placeholder-[var(--glass-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--glass-accent)]"
                          disabled={loading}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSaveEdit}
                          disabled={loading}
                          className="font-mono text-xs uppercase tracking-[0.15em] rounded-full border border-green-500 px-4 py-2 text-green-500 hover:bg-green-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={loading}
                          className="font-mono text-xs uppercase tracking-[0.15em] rounded-full border border-gray-500 px-4 py-2 text-gray-500 hover:bg-gray-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4">
                      <p className="text-sm text-[var(--glass-text-primary)]">
                        {item.notes || 'No notes provided.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

