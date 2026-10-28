'use client';

import React, { useRef } from 'react';

export interface DigitalCardData {
  id: string;
  membershipNumber: string;
  name: string;
  phone: string;
  email: string;
  planName: string;
  price?: number;
  durationDays?: number;
  durationLabel?: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  source: 'ONLINE' | 'WALK_IN';
  remainingDays?: number;
  features?: string[];
  facility?: {
    gymName: string;
    address: string;
    phone: string;
    whatsapp: string;
    timings: string;
  };
}

interface DigitalMembershipCardProps {
  card: DigitalCardData;
  onClose?: () => void;
  showPrintButton?: boolean;
}

export const DigitalMembershipCard: React.FC<DigitalMembershipCardProps> = ({
  card,
  onClose,
  showPrintButton = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const formattedStart = new Date(card.startDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedEnd = new Date(card.endDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handlePrintPdf = () => {
    window.print();
  };

  const isExpired = card.status === 'EXPIRED';

  return (
    <div className="space-y-4">
      {/* Printable Card Container */}
      <div
        ref={cardRef}
        id="digital-gymnation-pass"
        className="w-full max-w-lg mx-auto bg-gradient-to-br from-[#1A1616] via-[#100D0D] to-[#0A0808] border-2 border-[#F2B91D] p-6 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.8)] relative overflow-hidden text-[#F4EFE8]"
      >
        {/* Decorative Gold & Maroon Accent Background Lines */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#7A1F25]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#F2B91D]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7A1F25] via-[#F2B91D] to-[#7A1F25]" />

        {/* Card Header Strip */}
        <div className="flex items-start justify-between pb-4 border-b border-white/15 relative z-10">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/gymnationlogo.png"
              alt="GymNation"
              className="w-12 h-12 object-contain filter drop-shadow-md"
            />
            <div>
              <div className="font-heading text-2xl font-bold tracking-widest text-white uppercase leading-none">
                GYMNATION
              </div>
              <div className="text-[10px] font-mono tracking-widest text-[#F2B91D] font-medium uppercase mt-1">
                THE FITNESS HUB &bull; OFFICIAL ATHLETE ACCESS
              </div>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest border ${
                isExpired
                  ? 'bg-red-950/80 text-red-400 border-red-700'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-600 shadow-md'
              }`}
            >
              {isExpired ? 'EXPIRED' : 'ACTIVE PASS'}
            </span>
            <div className="text-[9px] font-mono text-zinc-400 uppercase mt-1">
              {card.source === 'ONLINE' ? 'ONLINE ENROLLED' : 'WALK-IN DESK'}
            </div>
          </div>
        </div>

        {/* Member Identification Area */}
        <div className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center relative z-10">
          {/* Member Name & Pass Tier */}
          <div className="sm:col-span-8 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-medium block">
              OFFICIAL ATHLETE PASS
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-white tracking-wider truncate">
              {card.name}
            </h3>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 bg-[#7A1F25] text-white font-heading font-semibold text-xs uppercase tracking-wider">
                {card.planName}
              </span>
              <span className="text-xs font-mono font-bold text-[#F2B91D]">
                {card.durationLabel || `${card.durationDays || 30} DAYS`}
              </span>
            </div>

            <div className="pt-2 text-[11px] font-mono text-zinc-300 space-y-0.5">
              <div>PHONE: <strong className="text-white">{card.phone}</strong></div>
              {card.email && (
                <div className="truncate">EMAIL: <span className="text-zinc-200">{card.email}</span></div>
              )}
            </div>
          </div>

          {/* Hologram Chip & QR Barcode Visual */}
          <div className="sm:col-span-4 flex flex-col items-center sm:items-end justify-center space-y-2">
            {/* Gold Security Micro-Chip Graphic */}
            <div className="w-11 h-8 rounded bg-gradient-to-tr from-amber-600 via-yellow-300 to-amber-700 p-1 border border-yellow-200/50 shadow-inner flex flex-col justify-between">
              <div className="h-0.5 bg-amber-900/40 w-full" />
              <div className="h-0.5 bg-amber-900/40 w-full" />
              <div className="h-0.5 bg-amber-900/40 w-full" />
            </div>

            {/* Simulated Digital Security QR Matrix */}
            <div className="p-1.5 bg-white border border-white/20 rounded-sm shadow-md">
              {/* Scalable Vector QR Code Graphic */}
              <svg className="w-16 h-16" viewBox="0 0 100 100" fill="black">
                {/* QR Positioning Corners */}
                <rect x="0" y="0" width="30" height="30" fill="black" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="10" y="10" width="10" height="10" fill="black" />

                <rect x="70" y="0" width="30" height="30" fill="black" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="80" y="10" width="10" height="10" fill="black" />

                <rect x="0" y="70" width="30" height="30" fill="black" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="10" y="80" width="10" height="10" fill="black" />

                {/* QR Data Grid Matrix */}
                <rect x="36" y="8" width="6" height="6" />
                <rect x="48" y="8" width="6" height="6" />
                <rect x="36" y="20" width="6" height="6" />
                <rect x="52" y="20" width="6" height="6" />
                <rect x="40" y="32" width="6" height="6" />
                <rect x="20" y="44" width="6" height="6" />
                <rect x="32" y="44" width="6" height="6" />
                <rect x="48" y="44" width="6" height="6" />
                <rect x="64" y="44" width="6" height="6" />
                <rect x="76" y="44" width="6" height="6" />
                <rect x="8" y="56" width="6" height="6" />
                <rect x="24" y="56" width="6" height="6" />
                <rect x="40" y="56" width="6" height="6" />
                <rect x="56" y="56" width="6" height="6" />
                <rect x="72" y="56" width="6" height="6" />
                <rect x="40" y="68" width="6" height="6" />
                <rect x="64" y="68" width="6" height="6" />
                <rect x="80" y="68" width="6" height="6" />
                <rect x="36" y="80" width="6" height="6" />
                <rect x="52" y="80" width="6" height="6" />
                <rect x="68" y="80" width="6" height="6" />
              </svg>
            </div>
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest text-center">
              SCAN AT TURNSTILE
            </span>
          </div>
        </div>

        {/* Start Date & End Date Validity Grid */}
        <div className="p-3.5 bg-black/60 border border-white/10 rounded-sm grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10 text-xs font-mono">
          <div>
            <span className="text-[9px] text-[#F2B91D] uppercase font-bold tracking-wider block">
              START DATE
            </span>
            <strong className="text-white text-sm block mt-0.5">{formattedStart}</strong>
          </div>

          <div>
            <span className="text-[9px] text-[#F2B91D] uppercase font-bold tracking-wider block">
              EXPIRY / END DATE
            </span>
            <strong className="text-white text-sm block mt-0.5">{formattedEnd}</strong>
          </div>

          <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3">
            <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider block">
              REMAINING
            </span>
            <strong
              className={`text-sm block mt-0.5 ${
                isExpired ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {isExpired ? '0 DAYS' : `${card.remainingDays ?? 'ACTIVE'} DAYS`}
            </strong>
          </div>
        </div>

        {/* Card Footer Strip - Unique Pass ID (Prominent & Clean) */}
        <div className="pt-4 mt-4 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold block">
              UNIQUE PASS ID
            </span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#F2B91D] tracking-widest block mt-0.5">
              {card.membershipNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.04] border border-[#F2B91D]/30 text-zinc-300 font-mono text-[10px] tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>VERIFIED GYMNATION PASS</span>
          </div>
        </div>
      </div>

      {/* Action Controls for Download / Print */}
      {showPrintButton && (
        <div className="flex items-center justify-center gap-3 pt-2 print:hidden">
          <button
            onClick={handlePrintPdf}
            className="px-6 py-3 bg-[#F2B91D] hover:bg-white text-black font-sans font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
          >
            <span>🖨️ PRINT / DOWNLOAD PDF</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-3 border border-white/20 text-white hover:border-[#F2B91D] font-sans font-semibold text-xs uppercase tracking-widest transition-colors"
            >
              CLOSE
            </button>
          )}
        </div>
      )}
    </div>
  );
};
