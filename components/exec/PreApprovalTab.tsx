import { getPreApprovedEmails } from '@/lib/actions/exec';
import PreApprovalListClient from './PreApprovalListClient';

export default async function PreApprovalTab() {
  const preApprovedEmails = await getPreApprovedEmails();

  return <PreApprovalListClient initialEmails={preApprovedEmails} />;
}
