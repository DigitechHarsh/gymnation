'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminRedirectPage() {
  const [adminUrl, setAdminUrl] = useState<string>('http://localhost:3001');
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    // Determine admin panel URL based on environment or current host
    const configuredUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
    let target = configuredUrl;

    if (!target) {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          target = 'http://localhost:3001';
        } else {
          // In production on Vercel, e.g. gymnation.vercel.app -> gymnation-admin.vercel.app or /admin route
          target = `https://${hostname.replace('gymnation', 'gymnation-admin')}`;
        }
      } else {
        target = 'http://localhost:3001';
      }
    }

    setAdminUrl(target);

    // Auto-redirect timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (typeof window !== 'undefined') {
            window.location.href = target;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0A0A] text-[#F4EFE8] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-[#161313] border-2 border-white/10 p-8 sm:p-10 shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7A1F25] via-[#F2B91D] to-[#7A1F25]" />

        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F2B91D]/10 border border-[#F2B91D]/30 text-[#F2B91D] text-xs font-mono tracking-widest uppercase">
            <span className="w-2 h-2 bg-green-400 inline-block animate-pulse" />
            <span>GYMNATION CONTROL CONSOLE</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-white">
            ADMIN ACCESS DESK
          </h1>

          <p className="text-xs text-zinc-300 font-mono leading-relaxed max-w-md mx-auto">
            REDIRECTING TO MANAGEMENT CONSOLE IN <span className="text-[#F2B91D] font-bold text-sm">{countdown}s</span>...
          </p>

          <div className="py-4">
            <a
              href={adminUrl}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-[#7A1F25] hover:bg-[#A82830] text-white font-heading font-bold text-sm uppercase tracking-widest transition-colors shadow-lg border border-[#F2B91D]/30"
            >
              <span>LAUNCH MANAGEMENT CONSOLE NOW &rarr;</span>
            </a>
          </div>

          <div className="p-4 bg-[#0B0A0A] border border-white/10 text-left space-y-2 text-xs font-mono">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              SYSTEM CREDENTIALS
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-500">TARGET CONSOLE:</span>
              <span className="text-[#F2B91D] truncate max-w-[240px]">{adminUrl}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-500">SUPER ADMIN:</span>
              <span className="text-white">admin@gymnation.in</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-500">PHYSICAL LOCATION:</span>
              <span className="text-white">Bhatar, Surat, Gujarat</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="text-xs font-mono uppercase text-zinc-400 hover:text-white transition-colors"
            >
              &larr; Return to Storefront Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
