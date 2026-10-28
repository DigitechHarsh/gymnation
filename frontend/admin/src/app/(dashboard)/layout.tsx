'use client';

import React from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { MapPinIcon } from '../../components/common/Icons';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gn-black text-gn-ivory">
        <div className="border border-gn-border bg-gn-surface p-8 max-w-sm text-center">
          <div className="font-heading text-xl font-bold tracking-wider mb-2">INITIALIZING CONSOLE</div>
          <p className="text-xs text-gn-muted font-mono tracking-widest uppercase">
            VERIFYING CREDENTIALS...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via AuthContext
  }

  return (
    <div className="min-h-screen bg-gn-black text-gn-ivory flex flex-col lg:flex-row w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-gn-surface border-b border-gn-border sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-widest text-gn-muted flex items-center gap-1.5">
              <MapPinIcon className="w-3.5 h-3.5 text-gn-maroon" />
              <span>BHATAR, SURAT, GUJARAT, IN</span>
            </span>
            <span className="text-gn-border">|</span>
            <span className="text-xs uppercase font-mono tracking-wider text-gn-gold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-none inline-block animate-pulse" />
              <span>STORE STATUS: ONLINE</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs uppercase font-semibold text-gn-ivory">{user.name}</div>
              <div className="text-[10px] text-gn-muted font-mono uppercase">{user.role}</div>
            </div>
            <div className="w-2.5 h-2.5 bg-green-500 rounded-none border border-green-400 animate-pulse" />
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
