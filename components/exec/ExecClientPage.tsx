'use client';

import { useState } from 'react';
import UserSearchTab from './UserSearchTab';

type TabType = 'waitlist' | 'search' | 'preapproved';

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 font-mono text-sm tracking-[0.1em] uppercase rounded-lg transition-all ${
        active
          ? 'bg-[var(--glass-accent)] text-white border border-[var(--glass-accent)]'
          : 'bg-transparent text-[var(--glass-text-muted)] border border-[var(--glass-border)] hover:border-[var(--glass-accent)] hover:text-[var(--glass-accent)]'
      }`}
    >
      {children}
    </button>
  );
}

export default function ExecClientPage({ waitlistTab, preApprovalTab }: { waitlistTab: React.ReactNode; preApprovalTab: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('waitlist');

  return (
    <>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8">
        <TabButton
          active={activeTab === 'waitlist'}
          onClick={() => setActiveTab('waitlist')}
        >
          Waitlist
        </TabButton>
        <TabButton
          active={activeTab === 'preapproved'}
          onClick={() => setActiveTab('preapproved')}
        >
          Pre-Approval
        </TabButton>
        <TabButton
          active={activeTab === 'search'}
          onClick={() => setActiveTab('search')}
        >
          User Search
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === 'waitlist' && waitlistTab}
      {activeTab === 'preapproved' && preApprovalTab}
      {activeTab === 'search' && <UserSearchTab />}
    </>
  );
}
