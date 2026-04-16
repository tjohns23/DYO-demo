interface PersonalRecordsPanelProps {
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalTimeInvestedMinutes: number;
  fastestMissionMinutes: number | null;
  bestDayOfWeek: string | null;
}

export default function PersonalRecordsPanel({
  totalCompleted,
  currentStreak,
  longestStreak,
  totalTimeInvestedMinutes,
  fastestMissionMinutes,
  bestDayOfWeek,
}: PersonalRecordsPanelProps) {
  const hours = Math.floor(totalTimeInvestedMinutes / 60);
  const mins = totalTimeInvestedMinutes % 60;
  const timeLabel = hours > 0
    ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
    : `${mins}m`;

  const missionsToRestore = longestStreak > 0 && currentStreak < longestStreak
    ? longestStreak - currentStreak
    : null;

  const records: { label: string; value: string; unit?: string; highlight?: boolean }[] = [
    {
      label: 'Longest streak',
      value: String(longestStreak),
      unit: longestStreak === 1 ? 'mission' : 'missions',
    },
    ...(missionsToRestore != null
      ? [{
          label: 'To restore streak',
          value: String(missionsToRestore),
          unit: missionsToRestore === 1 ? 'mission' : 'missions',
          highlight: true,
        }]
      : []),
    { label: 'Time invested', value: timeLabel },
    ...(fastestMissionMinutes != null
      ? [{ label: 'Fastest mission', value: String(fastestMissionMinutes), unit: 'min' }]
      : []),
    ...(bestDayOfWeek ? [{ label: 'Best day', value: bestDayOfWeek }] : []),
  ];

  return (
    <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-5 flex flex-col gap-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--glass-text-muted)] pb-2.5 border-b border-[rgba(255,255,255,0.05)]">
        Personal Records
      </div>
      {totalCompleted === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--glass-surface)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--glass-text-dimmer)] text-lg">
            ◌
          </div>
          <div className="text-xs text-[var(--glass-text-dimmer)] text-center font-mono uppercase tracking-[0.1em]">
            Complete a mission<br />to unlock
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pt-1">
          {records.map((r) => (
            <div key={r.label}>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--glass-text-dimmer)] mb-1">
                {r.label}
              </div>
              <div
                className="font-mono text-xl font-semibold"
                style={{ color: r.highlight ? '#e03060' : 'var(--glass-text-primary)' }}
              >
                {r.value}
                {r.unit && (
                  <span className="text-xs font-normal text-[var(--glass-text-muted)] ml-1">{r.unit}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
