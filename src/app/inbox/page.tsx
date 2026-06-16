'use client';

import { EmailList } from '@/components/email/EmailList';
import { WorkspaceProviders } from '@/components/providers/WorkspaceProviders';

export default function InboxPage() {
  return (
    <WorkspaceProviders>
      <EmailList folder="inbox" />
    </WorkspaceProviders>
  );
}
