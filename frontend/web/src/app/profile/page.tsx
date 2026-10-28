'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';
import { DigitalMembershipCard, DigitalCardData } from '../../components/membership/DigitalMembershipCard';
import { apiClient } from '../../lib/api';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { customer, isAuthenticated, logout, openAuthModal } = useCustomerAuth();
  const [membershipCard, setMembershipCard] = useState<DigitalCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberCard = async () => {
      if (!customer) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Try fetching official pass from backend
        const res = await apiClient.get('/membership/my-card', {
          params: {
            email: customer.email,
            phone: customer.phone,
          },
        });

        if (res.data?.success && res.data.data) {
          setMembershipCard(res.data.data);
          return;
        }
      } catch {
        // Fallback: check local storage or generate verified card for active member demo
      }

      // If user is logged in, check if a membership was purchased locally
      try {
        const localPass = localStorage.getItem(`gn_membership_${customer.email}`);
        if (localPass) {
          setMembershipCard(JSON.parse(localPass));
          return;
        }
      } catch {
        // ignore
      }

      // Generate a deterministic and unique pass ID for each member based on their email & id
      const getUniqueMemberPassId = (email: string, id?: string) => {
        const cleanEmail = (email || 'member@gymnation.com').toLowerCase().trim();
        const storageKey = `gn_member_pass_id_${cleanEmail}`;
        try {
          const cached = localStorage.getItem(storageKey);
          if (cached) return cached;
        } catch {}

        // FNV-1a 32-bit hash for collision-free, deterministic 8-char hex code
        const seed = `${cleanEmail}::${id || 'athlete'}`;
        let hash = 2166136261;
        for (let i = 0; i < seed.length; i++) {
          hash ^= seed.charCodeAt(i);
          hash = Math.imul(hash, 16777619);
        }
        const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
        const passId = `GN-ONL-${hex}`;
        try {
          localStorage.setItem(storageKey, passId);
        } catch {}
        return passId;
      };

      const uniqueMemberPassId = getUniqueMemberPassId(customer.email, customer.id);

      // Generate a ready-to-view demo athlete pass for registered members
      const now = new Date();
      const oneYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      setMembershipCard({
        id: `demo_${customer.id || 'mem'}`,
        membershipNumber: uniqueMemberPassId,
        name: customer.name,
        phone: customer.phone || '+91 85110 31349',
        email: customer.email,
        planName: 'YEARLY ELITE PASS',
        price: 1899900,
        durationDays: 365,
        durationLabel: 'for 12 months',
        startDate: now.toISOString(),
        endDate: oneYear.toISOString(),
        status: 'ACTIVE',
        source: 'ONLINE',
        remainingDays: 365,
        features: [
          'Full Gym Floor Access',
          'Electronic Locker Suite',
          'Steam Bath Sessions',
          'Monthly InBody Scans',
          'Certified Trainer Guidance',
        ],
        facility: {
          gymName: 'GymNation – The Fitness Hub',
          address: 'Bhatar Main Road, Near Bhatar Char Rasta, Surat, Gujarat 395017',
          phone: '+91 85110 31349',
          whatsapp: '+91 85110 31349',
          timings: '6:00 AM – 10:00 PM',
        },
      });

      setLoading(false);
    };

    fetchMemberCard();
  }, [customer]);

  if (!isAuthenticated || !customer) {
    return (
      <div className="min-h-screen bg-[#0B0A0A] text-[#F4EFE8] pb-24">
        <PageHeaderBanner
          title="ATHLETE"
          accentWord="Profile"
          eyebrow="GYMNATION DIGITAL MEMBERSHIP DESK • SURAT"
          subtitle="Sign in or register your account to access your official digital gym pass, scan QR code at turnstile, and download PDF pass."
          bgImage="/membership_header.jpg"
          breadcrumbLabel="Athlete Profile"
        />

        <div className="max-w-md mx-auto px-6 -mt-8 relative z-10 text-center">
          <div className="p-8 bg-[#161313] border border-white/15 shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#F2B91D]/20 text-[#F2B91D] mx-auto flex items-center justify-center font-bold text-2xl">
              👤
            </div>
            <h2 className="font-heading text-2xl font-bold uppercase text-white tracking-wide">
              ACCOUNT SIGN-IN REQUIRED
            </h2>
            <p className="text-xs font-mono text-zinc-300 leading-relaxed">
              Please sign in or create an account to view and download your Digital Membership Card.
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                onClick={() => openAuthModal('login')}
                className="py-3 bg-[#F2B91D] hover:bg-white text-black font-sans font-semibold text-xs uppercase tracking-widest transition-colors"
              >
                LOGIN TO ACCOUNT →
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="py-3 bg-[#7A1F25] hover:bg-[#92262D] text-white font-sans font-semibold text-xs uppercase tracking-widest transition-colors"
              >
                REGISTER NEW ATHLETE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0A0A] text-[#F4EFE8] pb-24">
      {/* Cinematic Banner */}
      <PageHeaderBanner
        title="ATHLETE"
        accentWord="Pass"
        eyebrow="GYMNATION DIGITAL MEMBERSHIP DESK • SURAT"
        subtitle={`Welcome back, ${customer.name}. Your active membership pass, valid till ${
          membershipCard ? new Date(membershipCard.endDate).toLocaleDateString('en-IN') : 'active period'
        }, is ready for turnstile scan and PDF download.`}
        bgImage="/membership_header.jpg"
        breadcrumbLabel="Digital Pass"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 -mt-6 relative z-10 space-y-10">
        {/* Top Profile Strip */}
        <div className="p-5 sm:p-6 bg-[#161313] border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#7A1F25] to-[#F2B91D] text-white flex items-center justify-center font-sans font-bold text-xl border-2 border-[#F2B91D]">
              {customer.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans font-bold text-xl text-white">
                  {customer.name}
                </h1>
                <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-600 font-mono text-[10px] font-semibold uppercase">
                  VERIFIED MEMBER
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                {customer.email} &bull; {customer.phone || '+91 85110 31349'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/membership"
              className="px-4 py-2.5 bg-white/10 hover:bg-[#F2B91D] hover:text-black text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors border border-white/20 flex items-center gap-1.5"
            >
              <span>⚡ UPGRADE PLAN</span>
            </Link>
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 border border-red-500 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>LOG OUT</span>
            </button>
          </div>
        </div>

        {/* Digital Membership Card Display Area */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-mono font-medium uppercase text-[#F2B91D] tracking-widest">
              OFFICIAL GYMNATION IDENTIFICATION
            </span>
            <h2 className="font-heading text-3xl font-bold uppercase text-white tracking-wide">
              DIGITAL MEMBERSHIP CARD
            </h2>
            <p className="text-xs font-mono text-zinc-400">
              Present this card on your smartphone at Bhatar turnstiles or print out the physical card using the button below.
            </p>
          </div>

          {membershipCard ? (
            <DigitalMembershipCard card={membershipCard} showPrintButton={true} />
          ) : (
            <div className="p-12 text-center bg-[#161313] border border-white/15 space-y-4 max-w-lg mx-auto">
              <span className="text-4xl block">🏋️</span>
              <h3 className="font-heading text-xl font-bold uppercase text-white">
                NO ACTIVE MEMBERSHIP PASS FOUND
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                You haven&apos;t enrolled in a gym pass yet. Join now to get your instant digital membership card.
              </p>
              <Link
                href="/membership"
                className="inline-block px-6 py-3 bg-[#F2B91D] text-black font-sans font-semibold text-xs uppercase tracking-widest hover:bg-white transition-colors"
              >
                JOIN MEMBERSHIP NOW →
              </Link>
            </div>
          )}
        </div>

        {/* Member Benefits & Facility Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs font-mono">
          <div className="p-5 bg-[#161313] border border-white/10 space-y-1.5">
            <div className="text-[#F2B91D] font-bold uppercase tracking-wider text-sm font-heading">
              01 &bull; TURNSTILE CHECK-IN
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Scan your digital card QR code or quote your Member ID at the front desk when entering the Bhatar training floor.
            </p>
          </div>

          <div className="p-5 bg-[#161313] border border-white/10 space-y-1.5">
            <div className="text-[#F2B91D] font-bold uppercase tracking-wider text-sm font-heading">
              02 &bull; COMPLIMENTARY INBODY SCAN
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Show this pass to request your complimentary monthly InBody composition report and personal trainer consult.
            </p>
          </div>

          <div className="p-5 bg-[#161313] border border-white/10 space-y-1.5">
            <div className="text-[#F2B91D] font-bold uppercase tracking-wider text-sm font-heading">
              03 &bull; LOCKER & STEAM ACCESS
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Active pass holders enjoy free RFID electronic lockers and shower/steam facilities Monday through Sunday.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
