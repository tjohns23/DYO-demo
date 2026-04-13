'use client';

import { useState } from 'react';
import { searchUserByEmail, toggleMissionComplete, type UserWithMissions } from '@/lib/actions/exec';

export default function UserSearchTab() {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<UserWithMissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUser(null);

    const result = await searchUserByEmail(email);
    if (result.success && result.user) {
      setUser(result.user);
    } else {
      setError(result.error || 'Failed to search user');
    }
    setLoading(false);
  }

  async function handleToggleMission(missionId: string, currentStatus: string) {
    setToggleLoading(missionId);
    const isCurrentlyComplete = currentStatus === 'completed';
    const result = await toggleMissionComplete(missionId, !isCurrentlyComplete);

    if (result.success && user) {
      // Update local state
      const updatedMissions = user.missions.map(m =>
        m.id === missionId
          ? {
              ...m,
              status: isCurrentlyComplete ? 'accepted' : 'completed',
              completed_at: isCurrentlyComplete ? null : new Date().toISOString(),
              time_to_completion: isCurrentlyComplete ? null : 0,
            }
          : m
      );
      setUser({ ...user, missions: updatedMissions });
    } else {
      setError(result.error || 'Failed to update mission');
    }
    setToggleLoading(null);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h1 className="font-mono text-xs tracking-[0.2em] text-[var(--glass-text-muted)] uppercase mb-1">Executive Suite</h1>
        <p className="text-2xl font-semibold text-[var(--glass-text-primary)]">User Search & Mission Management</p>
      </div>

      {/* Search Form */}
      <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="email"
            placeholder="Enter user email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-[var(--glass-surface-dark)] border border-[var(--glass-border)] text-[var(--glass-text-primary)] placeholder-[var(--glass-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--glass-accent)]"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="font-mono text-xs px-4 py-2 rounded-full border border-[var(--glass-accent)] text-[var(--glass-accent)] hover:bg-[var(--glass-accent-dim)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && <div className="text-xs text-red-600 mt-3 font-mono">{error}</div>}
      </div>

      {/* User Details and Missions */}
      {user && (
        <div>
          {/* User Info Card */}
          <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-mono text-xs text-[var(--glass-text-muted)] uppercase mb-1">Email</p>
                <p className="text-sm font-semibold text-[var(--glass-text-primary)]">{user.email}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-[var(--glass-text-muted)] uppercase mb-1">Status</p>
                <p className="text-sm font-semibold text-[var(--glass-text-primary)]">
                  {user.beta_approved ? '✓ Approved' : '⏳ Waiting'}
                </p>
              </div>
              <div>
                <p className="font-mono text-xs text-[var(--glass-text-muted)] uppercase mb-1">Archetype</p>
                <p className="text-sm text-[var(--glass-text-primary)]">{user.archetype_slug || '—'}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-[var(--glass-text-muted)] uppercase mb-1">Joined</p>
                <p className="text-sm text-[var(--glass-text-primary)]">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Missions */}
          <div>
            <h3 className="font-mono text-xs tracking-[0.15em] text-[var(--glass-text-muted)] uppercase mb-3">
              Missions ({user.missions.length})
            </h3>

            {user.missions.length === 0 ? (
              <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-6 text-center">
                <p className="text-[var(--glass-text-muted)] text-sm">No missions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {user.missions.map((mission) => (
                  <div
                    key={mission.id}
                    className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-mono border ${getStatusColor(
                              mission.status
                            )}`}
                          >
                            {mission.status}
                          </span>
                          <span className="text-xs font-mono text-[var(--glass-text-muted)] uppercase tracking-[0.1em]">
                            {mission.mode}
                          </span>
                          <span className="text-xs font-mono text-[var(--glass-text-muted)]">{mission.work_type}</span>
                        </div>
                        <p className="text-sm font-semibold text-[var(--glass-text-primary)] mb-1 line-clamp-2">
                          {mission.framing}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleMission(mission.id, mission.status)}
                        disabled={toggleLoading === mission.id || mission.status === 'pending'}
                        className="ml-3 font-mono text-xs px-3 py-1.5 rounded-full border border-[var(--glass-accent)] text-[var(--glass-accent)] hover:bg-[var(--glass-accent-dim)] disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                      >
                        {toggleLoading === mission.id
                          ? 'Updating...'
                          : mission.status === 'completed'
                            ? 'Mark Incomplete'
                            : 'Mark Complete'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="font-mono text-xs text-[var(--glass-text-muted)] uppercase mb-1">Scope</p>
                        <p className="text-xs text-[var(--glass-text-primary)] line-clamp-2">{mission.scope}</p>
                      </div>
                      <div>
                        <p className="font-mono text-xs text-[var(--glass-text-muted)] uppercase mb-1">Constraint</p>
                        <p className="text-xs text-[var(--glass-text-primary)] line-clamp-2">{mission.constraint_rule}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-mono text-xs text-[var(--glass-text-muted)] uppercase mb-0.5">Timebox</p>
                        <p className="text-[var(--glass-text-primary)]">{mission.timebox} minutes</p>
                      </div>
                      <div>
                        <p className="font-mono text-xs text-[var(--glass-text-muted)] uppercase mb-0.5">Created</p>
                        <p className="text-[var(--glass-text-primary)]">
                          {new Date(mission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {mission.completed_at && (
                        <div>
                          <p className="font-mono text-xs text-[var(--glass-text-muted)] uppercase mb-0.5">Completed</p>
                          <p className="text-[var(--glass-text-primary)]">
                            {new Date(mission.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {mission.time_to_completion && (
                        <div>
                          <p className="font-mono text-xs text-[var(--glass-text-muted)] uppercase mb-0.5">Time Taken</p>
                          <p className="text-[var(--glass-text-primary)]">
                            {Math.round(mission.time_to_completion / 60)} min
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!user && !loading && (
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-8 text-center">
          <p className="text-[var(--glass-text-muted)] text-sm">Search for a user by email to view their missions.</p>
        </div>
      )}
    </div>
  );
}
