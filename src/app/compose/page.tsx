'use client';
import { ComposeModal } from '@/components/email/ComposeModal';
import { useRouter } from 'next/navigation';

export default function ComposePage() {
  const router = useRouter();
  return (
    <div className="p-4">
      <ComposeModal onClose={() => router.push('/')} />
    </div>
  );
}
