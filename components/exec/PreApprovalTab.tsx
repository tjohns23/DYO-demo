import { getPreApprovedEmails } from '@/lib/actions/exec';
import PreApprovalListClient from './PreApprovalListClient';

export default async function PreApprovalTab() {
  const preApprovedEmails = await getPreApprovedEmails();

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h1 className="font-mono text-xs tracking-[0.2em] text-[var(--glass-text-muted)] uppercase mb-1">Executive Suite</h1>
        <p className="text-2xl font-semibold text-[var(--glass-text-primary)]">Pre-Approval Management</p>
      </div>

      <PreApprovalListClient initialEmails={preApprovedEmails} />
    </div>
  );
}
