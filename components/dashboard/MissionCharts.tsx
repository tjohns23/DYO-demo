'use client';

import { useTheme } from 'next-themes';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart,
  ArcElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

Chart.register(ArcElement, Tooltip, CategoryScale, LinearScale, BarElement);

interface MissionChartsProps {
  completed: number;
  expired: number;
  weeklyBreakdown: { date: string; completed: number; expired: number }[];
}

export default function MissionCharts({ completed, expired, weeklyBreakdown }: MissionChartsProps) {
  const { theme } = useTheme();
  const donutData = {
    labels: ['Completed', 'Expired'],
    datasets: [
      {
        data: [completed, expired],
        backgroundColor: ['#3de08a', '#e05030'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const barData = {
    labels: weeklyBreakdown.map((d) => d.date),
    datasets: [
      {
        label: 'Completed',
        data: weeklyBreakdown.map((d) => d.completed),
        backgroundColor: 'rgba(61,224,138,0.65)',
        borderRadius: 3,
      },
      {
        label: 'Expired',
        data: weeklyBreakdown.map((d) => d.expired),
        backgroundColor: 'rgba(224,80,48,0.5)',
        borderRadius: 3,
      },
    ],
  };

  const sharedOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: {} } },
  };

  // Theme-aware grid colors
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const tickColor = theme === 'dark' ? '#7a5060' : '#353839';

  const barOptions = {
    ...sharedOptions,
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: tickColor, font: { family: 'monospace', size: 10 as number } },
        border: { color: borderColor },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: tickColor, font: { family: 'monospace', size: 10 as number }, stepSize: 1 },
        border: { color: borderColor },
      },
    },
  };

  const total = completed + expired;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Donut */}
      <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-5">
        <div className="text-sm font-medium text-[var(--glass-text-primary)] mb-0.5">Outcomes</div>
        <div className="text-xs text-[var(--glass-text-muted)] mb-4">All time</div>
        <div className="relative h-40">
          <Doughnut data={donutData} options={{ ...sharedOptions, cutout: '70%' }} />
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs text-[var(--glass-text-muted)]">
            <span className="w-2 h-2 rounded-full bg-[#3de08a] shrink-0" />
            Completed
            <span className="ml-auto font-mono text-[var(--glass-text-primary)]">
              {total > 0 ? Math.round((completed / total) * 100) : 0}%
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--glass-text-muted)]">
            <span className="w-2 h-2 rounded-full bg-[#e05030] shrink-0" />
            Expired
            <span className="ml-auto font-mono text-[var(--glass-text-primary)]">
              {total > 0 ? Math.round((expired / total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Bar */}
      <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-2xl p-5">
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
    </div>
  );
}
