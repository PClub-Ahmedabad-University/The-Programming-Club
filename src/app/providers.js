'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import * as gtag from '@/lib/gtag.js';

export function AnalyticsProvider() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    gtag.pageview(pathname);
  }, [pathname]);

  return null;
}
