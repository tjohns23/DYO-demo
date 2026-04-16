import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserArchetypeProfile, getUserArchetypeInfo } from '@/lib/actions/profile';
import NavHeader from '@/components/NavHeader';
import { getMissionStatsAction, getMissionHistoryAction, getActiveMissionAction } from '@/lib/actions/mission';
import ActiveMissionBanner from '@/components/dashboard/ActiveMissionBanner';
import MissionCharts from '@/components/dashboard/MissionCharts';
import PersonalRecordsPanel from '@/components/dashboard/PersonalRecordsPanel';
import CoachInsightsPanel from '@/components/dashboard/CoachInsightsPanel';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function DashboardPage() {
  const [profile, archetypeInfo, statsResult, historyResult, activeMissionResult] = await Promise.all([
    getUserArchetypeProfile(),
    getUserArchetypeInfo(),
    getMissionStatsAction(),
    getMissionHistoryAction(0),
    getActiveMissionAction(),
  ]);

  if (!profile) {
    redirect('/');
  }

  // Gate on beta approval — redirect unapproved users to waitlist
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profileData } = user
    ? await supabaseAdmin.from('profiles').select('beta_approved, is_exec').eq('id', user.id).single()
    : { data: null };
  if (!profileData?.beta_approved) redirect('/waitlist');
  const isExec = profileData?.is_exec ?? false;

  const stats = statsResult.stats;
  const missions = historyResult.missions ?? [];
  const activeMission = activeMissionResult.mission;

  return (
    <div className="min-h-screen bg-background" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(120,20,50,0.25) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 80% 100%, rgba(80,10,30,0.2) 0%, transparent 60%)' }}>

      <NavHeader activePage="dashboard" archetypeName={archetypeInfo?.name ?? 'Unknown'} isExec={isExec} isBetaApproved={true} />

      {/* Three-column layout */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-[1fr_2.4fr_1fr] gap-4 p-4 pb-10 items-start">

        {/* LEFT — Personal Records */}
        {stats && (
          <PersonalRecordsPanel
            totalCompleted={stats.totalCompleted}
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
            totalTimeInvestedMinutes={stats.totalTimeInvestedMinutes}
            fastestMissionMinutes={stats.fastestMissionMinutes}
            bestDayOfWeek={stats.bestDayOfWeek}
          />
        )}

        {/* CENTER */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-6 flex flex-col gap-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_40px_rgba(0,0,0,0.3)]">

          {/* Welcome */}
          <div className="pb-1">
            <div className="text-2xl font-semibold text-[var(--glass-text-primary)] tracking-tight mb-1">
              Welcome back.
            </div>
            <div className="text-sm text-[var(--glass-text-muted)]">
              {stats && stats.totalCompleted > 0
                ? `You've completed ${stats.totalCompleted} of your last ${stats.totalCompleted + stats.totalExpired} missions.`
                : "Start your first mission to track your progress."}
            </div>
          </div>

          {/* Active mission banner or CTA */}
          {activeMission ? (
            <ActiveMissionBanner
              missionId={activeMission.missionId}
              scope={activeMission.scope}
              acceptedAt={activeMission.acceptedAt}
              timebox={activeMission.timebox}
            />
          ) : (
            <Link href="/mission" className="flex items-center justify-between bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 hover:border-[var(--glass-accent-border)] hover:bg-[rgba(224,48,96,0.04)] transition-all group">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--glass-text-dimmer)] mb-0.5">No active mission</div>
                <div className="text-sm font-medium text-[var(--glass-text-muted)] group-hover:text-[var(--glass-text-primary)] transition-colors">Start a new mission →</div>
              </div>
              <div className="font-mono text-3xl font-medium text-[var(--glass-text-dimmer)]">——</div>
            </Link>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-4 rounded-2xl overflow-hidden border border-[var(--glass-border)]" style={{ background: 'rgba(180,40,70,0.18)', gap: '1px' }}>
            <div className="bg-[var(--glass-surface)] px-4 py-[18px]">
              <div className="font-mono text-xl font-medium text-[var(--glass-accent)] mb-1">{stats?.completionRate ?? 0}%</div>
              <div className="text-xs text-[var(--glass-text-muted)]">Completion rate</div>
            </div>
            <div className="bg-[var(--glass-surface)] px-4 py-[18px]">
              <div className="font-mono text-xl font-medium text-[var(--glass-success)] mb-1">{stats?.totalCompleted ?? 0}</div>
              <div className="text-xs text-[var(--glass-text-muted)]">Completed</div>
              {stats && stats.totalGenerated > 0 && (
                <div className="text-[10px] text-[var(--glass-text-dimmer)] mt-0.5">of {stats.totalGenerated} total</div>
              )}
            </div>
            <div className="bg-[var(--glass-surface)] px-4 py-[18px]">
              <div className="font-mono text-xl font-medium text-[var(--glass-text-primary)] mb-1">
                {stats?.averageCompletionTimeMinutes != null ? (
                  <>{stats.averageCompletionTimeMinutes}<span className="text-sm text-[var(--glass-text-muted)]"> min</span></>
                ) : '—'}
              </div>
              <div className="text-xs text-[var(--glass-text-muted)]">Avg completion</div>
            </div>
            <div className="bg-[var(--glass-surface)] px-4 py-[18px]">
              <div className="font-mono text-xl font-medium text-[var(--glass-text-primary)] mb-1">{stats?.currentStreak ? '🔥 ' : ''}{stats?.currentStreak ?? 0}</div>
              <div className="text-xs text-[var(--glass-text-muted)]">Current streak</div>
            </div>
          </div>

          {/* Charts */}
          {stats && (
            <MissionCharts
              completed={stats.totalCompleted}
              expired={stats.totalExpired}
              biweeklyRaw={stats.biweeklyRaw}
              commonPatterns={stats.commonPatterns}
            />
          )}

          {/* Archetype + pattern bars */}
          <div className="bg-[rgba(224,48,96,0.05)] border border-[rgba(224,48,96,0.25)] rounded-2xl p-6">
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--glass-text-muted)] mb-1">Your Archetype</div>
            <div className="text-base font-semibold text-[var(--glass-accent)] mb-1">{archetypeInfo?.name}</div>
            <div className="text-xs text-[#9a7080] leading-relaxed mb-5">{profile.description}</div>

            {stats && stats.commonPatterns.length > 0 && (
              <>
                <div className="mb-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--glass-text-dimmer)]">Pattern Success Rates</div>
                  <div className="text-[10px] text-[#9a7080] mt-0.5">How often you finish each type of mission</div>
                </div>
                <div className="flex flex-col gap-3">
                  {stats.commonPatterns.map((p) => {
                    const barColor = p.completionRate >= 70
                      ? '#3de08a'
                      : p.completionRate >= 40
                      ? '#e0a030'
                      : '#e05030';
                    return (
                      <div key={p.name} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-[var(--glass-text-muted)] truncate">{p.name}</span>
                            <span className="font-mono text-[9px] text-[var(--glass-text-dimmer)] shrink-0">({p.total})</span>
                          </div>
                          <span className="font-mono text-[10px] font-medium shrink-0 ml-2" style={{ color: barColor }}>
                            {p.completionRate}% completed
                          </span>
                        </div>
                        <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${p.completionRate}%`, background: barColor }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Mission history */}
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--glass-text-muted)] mb-3">Mission History</div>
            {missions.length === 0 ? (
              <div className="text-xs text-[var(--glass-text-dimmer)] text-center py-6 font-mono">No missions yet</div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {missions.map((m) => {
                  const isCompleted = m.status === 'completed';
                  const isExpired = m.status === 'expired';
                  const timeAgo = getTimeAgo(m.created_at);

                  return (
                    <div
                      key={m.id}
                      className="grid items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[rgba(255,255,255,0.015)] hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                      style={{ gridTemplateColumns: '8px 1fr auto auto' }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          background: isCompleted ? '#3de08a' : isExpired ? '#e05030' : '#e03060',
                          boxShadow: isCompleted ? '0 0 6px #3de08a' : isExpired ? '0 0 6px #e05030' : '0 0 6px #e03060',
                        }}
                      />
                      <div className="text-xs text-[var(--glass-text-secondary)] truncate">{m.scope}</div>
                      {m.pattern && (
                        <div className="font-mono text-[10px] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded text-[var(--glass-text-dimmer)]">
                          {m.pattern}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[var(--glass-text-muted)]">{timeAgo}</span>
                        <span
                          className="font-mono text-[10px] px-2 py-0.5 rounded"
                          style={{
                            background: isCompleted ? 'rgba(61,224,138,0.12)' : isExpired ? 'rgba(224,80,48,0.12)' : 'rgba(224,48,96,0.15)',
                            color: isCompleted ? '#3de08a' : isExpired ? '#e05030' : '#e03060',
                            border: `1px solid ${isCompleted ? 'rgba(61,224,138,0.2)' : isExpired ? 'rgba(224,80,48,0.2)' : 'rgba(224,48,96,0.3)'}`,
                          }}
                        >
                          {isCompleted ? 'done' : isExpired ? 'expired' : 'active'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Coach Insights */}
        {stats && (
          <CoachInsightsPanel
            totalCompleted={stats.totalCompleted}
            completionRate={stats.completionRate}
            currentStreak={stats.currentStreak}
            commonPatterns={stats.commonPatterns}
            timeboxEfficiencyPct={stats.timeboxEfficiencyPct}
          />
        )}

      </div>
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
