'use client';
import { ComposeModal } from '@/components/email/ComposeModal';

export default function ComposePage() {
  return (
    <div className="p-4">
      <ComposeModal onClose={() => { window.location.href = '/dashboard'; }} />
    </div>
  );
}
