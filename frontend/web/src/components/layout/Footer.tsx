'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import { PhoneIcon, MailIcon, MapPinIcon, WhatsAppIcon } from '../common/Icons';
import { validateEmail, sanitizeInput } from '../../lib/validation';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setStatus(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    try {
      const cleanEmail = sanitizeInput(email).toLowerCase();
      const res = await apiClient.post('/newsletter', { email: cleanEmail });
      if (res.data?.success) {
        setStatus('Subscribed! Check your inbox for your 10% welcome coupon.');
        setEmail('');
      }
    } catch {
      setStatus('Thank you for subscribing to GymNation VIP updates!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-gn-black border-t border-gn-border text-xs font-mono text-zinc-400">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Col 1: Brand Info (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/gymnationlogo.png" alt="GymNation Logo" className="w-10 h-10 object-contain" />
            <div>
              <div className="font-heading text-2xl font-extrabold tracking-widest text-gn-ivory uppercase">
                GYMNATION
              </div>
              <div className="text-[10px] text-gn-gold tracking-widest uppercase">THE FITNESS HUB</div>
            </div>
          </div>

          <p className="text-zinc-400 font-normal leading-relaxed text-[11px]">
            Surat's flagship fitness training floor and authorized nutrition store located at Bhatar.
            Discipline builds freedom &bull; stronger people, stronger tomorrow.
          </p>

          <div className="text-[10px] text-zinc-500 uppercase">
            GSTIN: 24AAAAA0000A1Z5 &bull; BHATAR, SURAT, GUJARAT, INDIA
          </div>
        </div>

        {/* Col 2: Navigation Multi-Pages (3 cols) */}
        <div className="md:col-span-3 space-y-4">
          <div className="text-xs uppercase font-heading font-bold text-[#F2B91D] tracking-widest border-b border-gn-border pb-2">
            EXPLORE PAGES
          </div>
          <div className="space-y-2 uppercase">
            <div><Link href="/" className="font-sans font-medium text-xs tracking-wider text-zinc-300 hover:text-[#F2B91D] transition-colors">HOME</Link></div>
            <div><Link href="/about" className="font-sans font-medium text-xs tracking-wider text-zinc-300 hover:text-[#F2B91D] transition-colors">ABOUT US</Link></div>
            <div><Link href="/why-us" className="font-sans font-medium text-xs tracking-wider text-zinc-300 hover:text-[#F2B91D] transition-colors">WHY GYMNATION</Link></div>
            <div><Link href="/gallery" className="font-sans font-medium text-xs tracking-wider text-zinc-300 hover:text-[#F2B91D] transition-colors">FACILITY GALLERY</Link></div>
            <div><Link href="/membership" className="font-sans font-medium text-xs tracking-wider text-zinc-300 hover:text-[#F2B91D] transition-colors">MEMBERSHIP PLANS</Link></div>
            <div><Link href="/products" className="font-sans font-medium text-xs tracking-wider text-zinc-300 hover:text-[#F2B91D] transition-colors">SUPPLEMENTS STORE</Link></div>
            <div><Link href="/testimonials" className="font-sans font-medium text-xs tracking-wider text-zinc-300 hover:text-[#F2B91D] transition-colors">REAL RESULTS</Link></div>
            <div><Link href="/faq" className="font-sans font-medium text-xs tracking-wider text-zinc-300 hover:text-[#F2B91D] transition-colors">FAQ</Link></div>
            <div><Link href="/contact" className="font-sans font-medium text-xs tracking-wider text-zinc-300 hover:text-[#F2B91D] transition-colors">CONTACT DESK</Link></div>
          </div>
        </div>

        {/* Col 3: Contact & Timings (3 cols) */}
        <div className="md:col-span-3 space-y-4">
          <div className="text-xs uppercase font-heading font-bold text-[#F2B91D] tracking-widest border-b border-gn-border pb-2">
            CONTACT DESK
          </div>
          <div className="space-y-3.5">
            <div className="flex items-start gap-2.5">
              <MapPinIcon className="w-4 h-4 text-[#F2B91D] shrink-0 mt-0.5" />
              <span className="font-medium text-sm text-zinc-200">Bhatar, Surat, Gujarat 395017</span>
            </div>
            <div className="flex items-center gap-2.5">
              <PhoneIcon className="w-4 h-4 text-[#F2B91D] shrink-0" />
              <a href="tel:+918511031349" className="hover:underline font-semibold text-sm sm:text-base text-[#F2B91D]">
                +91 85110 31349
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" />
              <a
                href="https://wa.me/918511031349"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-[#25D366] font-semibold text-sm sm:text-base"
              >
                +91 85110 31349
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <MailIcon className="w-4 h-4 text-[#F2B91D] shrink-0" />
              <a href="mailto:info@gymnation.in" className="hover:text-[#F2B91D] font-medium text-sm text-zinc-200">
                info@gymnation.in
              </a>
            </div>
            <div className="pt-2 font-heading font-bold text-sm sm:text-base text-[#F2B91D] uppercase tracking-wider">
              OPEN DAILY: 6:00 AM – 10:00 PM
            </div>
          </div>
        </div>

        {/* Col 4: VIP Newsletter (3 cols) */}
        <div className="md:col-span-3 space-y-3">
          <div className="text-xs uppercase font-bold text-gn-ivory tracking-wider border-b border-gn-border pb-2">
            VIP NEWSLETTER
          </div>
          <p className="text-[11px] text-zinc-400">
            Subscribe for exclusive supplement discount coupons and workout programming drops.
          </p>

          <form onSubmit={handleNewsletter} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR EMAIL ADDRESS"
              required
              className="w-full bg-gn-surface border border-gn-border px-3 py-2 text-xs text-gn-ivory placeholder-zinc-600 focus:outline-none focus:border-gn-gold uppercase"
            />
            <button
              type="submit"
              className="w-full py-2 bg-gn-maroon hover:bg-gn-maroon/80 text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors"
            >
              SUBSCRIBE
            </button>
            {status && (
              <p className="text-[10px] text-gn-gold font-mono pt-1">{status}</p>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Legal Copyright Strip */}
      <div className="border-t border-gn-border/60 bg-gn-black/80 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-300 uppercase font-mono font-bold">
          <div>&copy; 2026 GYMNATION &bull; THE FITNESS HUB. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[#F2B91D] transition-colors">PRIVACY POLICY</Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-[#F2B91D] transition-colors">TERMS OF SERVICE</Link>
            <span>&bull;</span>
            <Link href="/contact" className="hover:text-[#F2B91D] transition-colors">LOCATION & CONTACT</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
