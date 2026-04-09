'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { expireMissionAction } from '@/lib/actions/mission';

interface ActiveMissionBannerProps {
  missionId: string;
  scope: string;
  acceptedAt: string;
  timebox: number;
}

export default function ActiveMissionBanner({ missionId, scope, acceptedAt, timebox }: ActiveMissionBannerProps) {
  const total = timebox * 60;
  const [totalSeconds, setTotalSeconds] = useState(() => {
    const elapsed = Math.floor((Date.now() - new Date(acceptedAt).getTime()) / 1000);
    return Math.max(0, total - elapsed);
  });
  const finalizedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          if (!finalizedRef.current) {
            finalizedRef.current = true;
            expireMissionAction(missionId);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [missionId]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isExpired = totalSeconds <= 0;

  return (
    <Link href="/mission" className="block">
      <div className="flex items-center justify-between bg-[rgba(139,47,66,0.08)] border-2 border-[var(--glass-accent)] rounded-2xl px-6 py-4 shadow-[inset_0_0_40px_rgba(139,47,66,0.06),0_0_20px_rgba(139,47,66,0.08)] hover:border-[var(--glass-accent)] transition-colors">
        <div className="flex items-center gap-3">
          {!isExpired && (
            <div className="w-2 h-2 rounded-full bg-[var(--glass-accent)] shadow-[0_0_8px_var(--glass-accent)] animate-pulse shrink-0" />
          )}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--glass-text-muted)] mb-0.5">
              {isExpired ? 'Mission Expired' : 'Active Mission'}
            </div>
            <div className="text-sm font-medium text-[var(--glass-text-primary)] truncate max-w-xs">
              {scope}
            </div>
          </div>
        </div>
        <div
          className="font-mono text-3xl font-medium tracking-tight"
          style={{ color: isExpired ? 'var(--glass-text-muted)' : 'var(--glass-accent)', textShadow: isExpired ? 'none' : '0 0 20px rgba(139,47,66,0.3)' }}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>
    </Link>
  );
}
