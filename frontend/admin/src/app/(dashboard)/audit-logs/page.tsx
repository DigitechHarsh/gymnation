'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuditLogsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings?tab=audit');
  }, [router]);

  return (
    <div className="flex h-96 items-center justify-center">
      <div className="text-center font-mono text-xs uppercase tracking-widest text-gn-muted">
        REDIRECTING TO SYSTEM & SETTINGS &rarr; ADMIN AUDIT ACTIVITY...
      </div>
    </div>
  );
}
