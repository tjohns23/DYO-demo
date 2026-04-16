interface CoachInsightsPanelProps {
  totalCompleted: number;
  completionRate: number;
  currentStreak: number;
  commonPatterns: { name: string; total: number; completionRate: number }[];
  timeboxEfficiencyPct: number | null;
}

function buildInsights({
  totalCompleted,
  completionRate,
  currentStreak,
  commonPatterns,
  timeboxEfficiencyPct,
}: CoachInsightsPanelProps): string[] {
  if (totalCompleted === 0) return [];

  const insights: string[] = [];

  // Streak momentum
  if (currentStreak >= 3) {
    insights.push(`You're on a ${currentStreak}-mission streak. Momentum is building.`);
  } else if (currentStreak === 0 && totalCompleted >= 3) {
    insights.push('Your streak was broken. One mission today resets the clock.');
  }

  // Strongest pattern (require at least 2 missions to be meaningful)
  const qualified = commonPatterns.filter((p) => p.total >= 2);
  if (qualified.length > 0) {
    const best = [...qualified].sort((a, b) => b.completionRate - a.completionRate)[0];
    if (best.completionRate >= 60) {
      insights.push(
        `You complete ${best.name} missions at ${best.completionRate}% — your strongest pattern.`
      );
    }
  }

  // Completion rate
  if (completionRate >= 80 && totalCompleted >= 5) {
    insights.push(`${completionRate}% completion rate. You're beating the average.`);
  } else if (completionRate < 50 && totalCompleted >= 5) {
    insights.push('Under 50% completion. Try tightening your scope on the next mission.');
  }

  // Timebox efficiency
  if (timeboxEfficiencyPct != null) {
    if (timeboxEfficiencyPct <= 55) {
      insights.push(
        `You use about ${timeboxEfficiencyPct}% of your timebox. Shorter windows might suit you better.`
      );
    } else if (timeboxEfficiencyPct >= 90) {
      insights.push(
        `You're using ${timeboxEfficiencyPct}% of your timebox on average — you're consistently cutting it close.`
      );
    }
  }

  return insights.slice(0, 3);
}

export default function CoachInsightsPanel(props: CoachInsightsPanelProps) {
  const insights = buildInsights(props);

  return (
    <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-5 flex flex-col gap-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--glass-text-muted)] pb-2.5 border-b border-[rgba(255,255,255,0.05)]">
        Insights
      </div>
      {insights.length === 0 ? (
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
          {insights.map((insight, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="text-[var(--glass-accent)] shrink-0 text-xs mt-0.5">▸</span>
              <p className="text-xs text-[var(--glass-text-secondary)] leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
