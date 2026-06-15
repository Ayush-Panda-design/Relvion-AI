'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#FFEE58',
          color: '#f1f5f9',
          border: '1px solid #FBC02D',
        },
      }}
    />
  );
}
