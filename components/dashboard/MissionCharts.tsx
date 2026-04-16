'use client';

import { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  DoughnutController,
} from 'chart.js';

Chart.register(Tooltip, CategoryScale, LinearScale, BarElement, ArcElement, DoughnutController);

interface MissionChartsProps {
  completed: number;
  expired: number;
  biweeklyRaw: { created_at: string; status: string }[];
  commonPatterns: { name: string; total: number; completionRate: number }[];
}

export function WeeklyOutcomesChart({ biweeklyRaw }: { biweeklyRaw: { created_at: string; status: string }[] }) {
  const { theme } = useTheme();
  const [now] = useState(() => Date.now());

  const weeklyBreakdown = useMemo(() => {
    const dayMap = new Map<string, { completed: number; expired: number }>();
    const daysWithWork = new Set<string>();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      dayMap.set(key, { completed: 0, expired: 0 });
    }

    for (const row of biweeklyRaw) {
      const key = new Date(row.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      const entry = dayMap.get(key);
      if (entry) {
        if (row.status === 'completed') {
          entry.completed++;
          daysWithWork.add(key);
        } else if (row.status === 'expired') {
          entry.expired++;
          daysWithWork.add(key);
        }
      }
    }
    return {
      breakdown: [...dayMap.entries()].map(([date, counts]) => ({ date, ...counts })),
      daysWorked: daysWithWork.size,
    };
  }, [biweeklyRaw, now]);

  const barData = {
    labels: weeklyBreakdown.breakdown.map((d) => d.date),
    datasets: [
      {
        label: 'Completed',
        data: weeklyBreakdown.breakdown.map((d) => d.completed),
        backgroundColor: 'rgba(61,224,138,0.65)',
        borderRadius: 3,
      },
      {
        label: 'Expired',
        data: weeklyBreakdown.breakdown.map((d) => d.expired),
        backgroundColor: 'rgba(224,80,48,0.5)',
        borderRadius: 3,
      },
    ],
  };

  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const tickColor = theme === 'dark' ? '#7a5060' : '#353839';

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: {} } },
    scales: {
      x: {
        stacked: true,
        grid: { color: gridColor },
        ticks: { color: tickColor, font: { family: 'monospace', size: 10 as number } },
        border: { color: borderColor },
      },
      y: {
        stacked: true,
        grid: { color: gridColor },
        ticks: { color: tickColor, font: { family: 'monospace', size: 10 as number }, stepSize: 1 },
        border: { color: borderColor },
      },
    },
  };

  return (
    <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <div className="text-sm font-medium text-[var(--glass-text-primary)] mb-0.5">Last 7 Days</div>
        <div className="flex gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-[var(--glass-text-muted)]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[rgba(61,224,138,0.65)]" />
            Completed
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--glass-text-muted)]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[rgba(224,80,48,0.5)]" />
            Expired
          </div>
        </div>
        <div className="relative h-40">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <div className="border-t border-[var(--glass-border)] pt-4">
        <div className="text-sm font-medium text-[var(--glass-text-primary)] mb-2">Days Worked</div>
        <div className="text-3xl font-mono font-semibold text-[var(--glass-accent)]">
          {weeklyBreakdown.daysWorked}<span className="text-sm text-[var(--glass-text-muted)] ml-1">/7</span>
        </div>
        <div className="text-xs text-[var(--glass-text-muted)] mt-1">Days with activity this week</div>
      </div>
    </div>
  );
}

const PATTERN_COLORS = ['#E93D71', '#8A355A', '#4A2B3D', '#C4486A', '#63314D'];

export function StallPatternDonutChart({ commonPatterns }: { commonPatterns: { name: string; total: number; completionRate: number }[] }) {
  const total = commonPatterns.reduce((sum, p) => sum + p.total, 0);

  if (commonPatterns.length === 0) {
    return (
      <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-5 flex flex-col gap-4">
        <div>
          <div className="text-sm font-medium text-[var(--glass-text-primary)] mb-0.5">Stall Patterns</div>
          <div className="text-xs text-[var(--glass-text-muted)]">Pattern distribution</div>
        </div>
        <div className="flex items-center justify-center flex-1 py-12 text-xs text-[var(--glass-text-dimmer)] font-mono uppercase tracking-[0.1em]">
          No patterns yet
        </div>
      </div>
    );
  }

  const donutData = {
    labels: commonPatterns.map((p) => p.name),
    datasets: [
      {
        data: commonPatterns.map((p) => p.total),
        backgroundColor: commonPatterns.map((_, i) => PATTERN_COLORS[i % PATTERN_COLORS.length]),
        borderColor: 'rgba(8, 4, 12, 0.95)',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: number }) =>
            ` ${ctx.parsed} mission${ctx.parsed !== 1 ? 's' : ''}`,
        },
      },
    },
  };

  return (
    <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <div className="text-sm font-semibold text-[var(--glass-text-primary)]">Stall patterns</div>
        <div className="text-xs text-[#9a6878] mt-0.5">Across all missions</div>
      </div>

      <div className="relative h-36">
        <Doughnut data={donutData} options={donutOptions} />
      </div>

      <div className="border-t border-[var(--glass-border)] pt-3 flex flex-col gap-2.5">
        {commonPatterns.map((p, i) => {
          const color = PATTERN_COLORS[i % PATTERN_COLORS.length];
          const pct = total > 0 ? Math.round((p.total / total) * 100) : 0;
          return (
            <div key={p.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <span className="text-xs text-[#9a6878] truncate">{p.name}</span>
              </div>
              <span className="font-mono text-xs font-medium text-[var(--glass-text-primary)] shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MissionCharts({ biweeklyRaw, commonPatterns }: MissionChartsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <WeeklyOutcomesChart biweeklyRaw={biweeklyRaw} />
      <StallPatternDonutChart commonPatterns={commonPatterns} />
    </div>
  );
}
