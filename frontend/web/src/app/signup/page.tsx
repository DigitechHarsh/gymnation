'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';
import { validateName, validateEmail, validateIndianPhone, validatePassword, sanitizeInput } from '../../lib/validation';

export default function CustomerSignupPage() {
  const router = useRouter();
  const { register, isAuthenticated, customer } = useCustomerAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoFill = () => {
    setName('Harshil Patel');
    setPhone('+91 85110 31349');
    setEmail('harshil.patel@gymnation.in');
    setPassword('Member@2026!');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validate full name
    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      setError(nameCheck.error || 'Please enter a valid full name.');
      return;
    }

    // 2. Validate email
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    // 3. Validate phone (if provided)
    let cleanPhone: string | undefined = undefined;
    if (phone.trim()) {
      const phoneCheck = validateIndianPhone(phone);
      if (!phoneCheck.isValid) {
        setError(phoneCheck.error || 'Please enter a valid 10-digit Indian phone number.');
        return;
      }
      cleanPhone = phoneCheck.cleanPhone;
    }

    // 4. Validate password
    const passwordCheck = validatePassword(password, 6);
    if (!passwordCheck.isValid) {
      setError(passwordCheck.error || 'Password must be at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const cleanName = sanitizeInput(name);
      const cleanEmail = sanitizeInput(email).toLowerCase();
      const success = await register(cleanName, cleanEmail, password, cleanPhone);
      if (success) {
        router.push('/membership');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated && customer) {
    return (
      <div className="min-h-screen bg-[#0B0A0A] text-[#F4EFE8] py-20 px-6 text-center space-y-6">
        <div className="max-w-md mx-auto p-8 bg-[#161313] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F2B91D]/20 text-[#F2B91D] mx-auto flex items-center justify-center font-bold text-xl">
            ✓
          </div>
          <h1 className="font-heading text-2xl uppercase font-bold text-white tracking-wide">
            ACTIVE ACCOUNT REGISTERED
          </h1>
          <p className="text-xs font-mono text-zinc-300">
            Logged in as <strong className="text-[#F2B91D]">{customer.name}</strong> ({customer.email})
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/membership"
              className="py-3 bg-[#F2B91D] text-[#0B0A0A] font-sans font-semibold text-xs uppercase tracking-widest hover:bg-white transition-colors"
            >
              BROWSE MEMBERSHIP TIERS →
            </Link>
            <Link
              href="/"
              className="py-3 border border-white/20 text-white font-sans font-semibold text-xs uppercase tracking-widest hover:border-[#F2B91D] hover:text-[#F2B91D] transition-colors"
            >
              RETURN TO STOREFRONT
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0A0A] text-[#F4EFE8] pb-24">
      <PageHeaderBanner
        eyebrow="ATHLETE REGISTRATION • SURAT"
        title="JOIN GYMNATION"
        subtitle="Create your member profile to unlock membership plans, fast-track supplement ordering, and save items to your wishlist."
        bgImage="/membership_header.jpg"
        breadcrumbLabel="Register"
      />

      <div className="max-w-md mx-auto px-6 -mt-8 relative z-10">
        <div className="p-8 bg-[#161313] border border-white/15 shadow-2xl relative">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#F2B91D] uppercase">
                NEW MEMBER ONBOARDING
              </span>
              <h2 className="font-heading text-xl uppercase font-bold tracking-wide text-white">
                CREATE ACCOUNT
              </h2>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-[10px] font-mono uppercase px-2 py-1 bg-white/5 border border-[#F2B91D]/40 text-[#F2B91D] hover:bg-[#F2B91D] hover:text-black transition-colors font-medium"
            >
              AUTO-FILL DEMO
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium mb-1">
                FULL NAME *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Harshil Patel"
                required
                className="w-full bg-[#0B0A0A] border border-white/20 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F2B91D] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium mb-1">
                PHONE NUMBER (SURAT / INDIA)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 85110 31349"
                className="w-full bg-[#0B0A0A] border border-white/20 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F2B91D] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium mb-1">
                EMAIL ADDRESS *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@gymnation.in"
                required
                className="w-full bg-[#0B0A0A] border border-white/20 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F2B91D] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium mb-1">
                CREATE PASSWORD *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full bg-[#0B0A0A] border border-white/20 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F2B91D] font-sans"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#F2B91D] text-[#0B0A0A] font-sans font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg hover:shadow-[#F2B91D]/20 disabled:opacity-50"
              >
                {submitting ? 'REGISTERING ACCOUNT...' : 'REGISTER & PROCEED →'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-zinc-400 font-mono">
              Already have an athlete account?{' '}
              <Link
                href="/login"
                className="text-[#F2B91D] font-bold hover:underline"
              >
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
