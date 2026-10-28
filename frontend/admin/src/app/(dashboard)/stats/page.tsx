'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StatsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/?tab=stats');
  }, [router]);

  return (
    <div className="flex h-96 items-center justify-center">
      <div className="text-center font-mono text-xs uppercase tracking-widest text-gn-muted">
        REDIRECTING TO DASHBOARD & ANALYTICS &rarr; STATS COUNTERS...
      </div>
    </div>
  );
}
