'use client';

import { Toaster } from 'react-hot-toast';

const toastBase = {
  background: 'var(--dash-elevated-bg)',
  color: 'var(--dash-text)',
  border: '1px solid var(--dash-border)',
  boxShadow: 'var(--dash-elevated-shadow)',
  borderRadius: '14px',
  fontSize: '13px',
  fontWeight: '500',
  padding: '12px 16px',
  maxWidth: '360px',
} as const;

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      gutter={12}
      toastOptions={{
        className: 'dash-toast',
        style: toastBase,
        success: {
          style: {
            ...toastBase,
            border: '1px solid var(--dash-toast-success-border, var(--dash-accent-soft-bg))',
            background: 'var(--dash-toast-success-bg, var(--dash-elevated-bg))',
          },
          iconTheme: {
            primary: 'var(--dash-accent)',
            secondary: 'var(--dash-elevated-bg)',
          },
        },
        error: {
          style: {
            ...toastBase,
            border: '1px solid rgba(239, 68, 68, 0.35)',
            background: 'var(--dash-elevated-bg)',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: 'var(--dash-elevated-bg)',
          },
        },
        loading: {
          style: toastBase,
        },
      }}
    />
  );
}
