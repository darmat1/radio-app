'use client';

import { useEffect, useState } from 'react';
import { initializeLanguage } from '@/lib/i18n';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
    initializeLanguage();
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}