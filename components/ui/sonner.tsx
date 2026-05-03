'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "group/toaster flex items-center gap-2 px-4 py-3 rounded-lg border bg-white shadow-lg",
        },
      }}
    />
  );
}
