'use client';

import React, { useEffect } from 'react';
import { initFirestoreSync } from '@/lib/storage';

export default function FirebaseSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Start real-time Firestore synchronization
    const unsubscribe = initFirestoreSync();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
