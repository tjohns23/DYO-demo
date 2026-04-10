'use client';

import { useState } from 'react';
import { approveUser } from '@/lib/actions/exec';

export default function ApproveButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setLoading(true);
    setError(null);
    try {
      const result = await approveUser(userId);
      if (!result.success) {
        setError(result.error || 'Failed to approve user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleApprove}
        disabled={loading}
        className="font-mono text-xs px-3.5 py-1.5 rounded-full border border-[var(--glass-accent)] text-[var(--glass-accent)] hover:bg-[var(--glass-accent-dim)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        {loading ? 'Approving...' : 'Approve'}
      </button>
      {error && (
        <div className="text-xs text-red-600 mt-2 font-mono">
          {error}
        </div>
      )}
    </div>
  );
}
