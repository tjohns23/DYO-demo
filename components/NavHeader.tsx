import Link from 'next/link';
import React from 'react';

interface NavHeaderProps {
  activePage: 'home' | 'mission' | 'dashboard' | 'exec';
  archetypeName?: string;
  rightSlot?: React.ReactNode;
  isExec?: boolean;
}

export default function NavHeader({ activePage, archetypeName, rightSlot, isExec }: NavHeaderProps) {
  const activeClass = 'font-mono text-xs px-4 py-1.5 rounded-full text-[var(--glass-accent)] border border-[var(--glass-border)] bg-[var(--glass-accent-dim)]';
  const inactiveClass = 'font-mono text-xs px-4 py-1.5 rounded-full text-[var(--glass-text-muted)] border border-transparent hover:border-[var(--glass-border)] hover:text-[var(--glass-text-primary)] transition-all';

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[var(--glass-surface)] backdrop-blur-[20px] border-b border-[var(--glass-border)]">
      <div className="font-mono text-sm font-medium text-[var(--glass-accent)] tracking-[0.2em]">DYO</div>
      <div className="flex gap-1">
        <Link href="/home" className={activePage === 'home' ? activeClass : inactiveClass}>
          Home
        </Link>
        <Link href="/mission" className={activePage === 'mission' ? activeClass : inactiveClass}>
          Mission
        </Link>
        <Link href="/dashboard" className={activePage === 'dashboard' ? activeClass : inactiveClass}>
          Dashboard
        </Link>
        {isExec && (
          <Link href="/exec" className={activePage === 'exec' ? activeClass : inactiveClass}>
            Executive Suite
          </Link>
        )}
      </div>
      <div>
        {rightSlot ?? (
          archetypeName ? (
            <div className="font-mono text-xs px-3.5 py-1.5 rounded-full border border-[var(--glass-border)] text-[var(--glass-accent)]">
              {archetypeName}
            </div>
          ) : (
            <div style={{ width: '1px' }} />
          )
        )}
      </div>
    </header>
  );
}
