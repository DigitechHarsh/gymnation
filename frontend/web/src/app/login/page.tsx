'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';
import { validateEmail, validatePassword, sanitizeInput } from '../../lib/validation';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, customer } = useCustomerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoFill = () => {
    setEmail('harshil.patel@gymnation.in');
    setPassword('Member@2026!');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Invalid email address.');
      return;
    }

    const passwordCheck = validatePassword(password, 6);
    if (!passwordCheck.isValid) {
      setError(passwordCheck.error || 'Password is required.');
      return;
    }

    try {
      setSubmitting(true);
      const cleanEmail = sanitizeInput(email).toLowerCase();
      const success = await login(cleanEmail, password);
      if (success) {
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check credentials.');
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
            YOU ARE LOGGED IN
          </h1>
          <p className="text-xs font-mono text-zinc-300">
            Welcome back, <strong className="text-[#F2B91D]">{customer.name}</strong> ({customer.email})
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/"
              className="py-3 bg-[#F2B91D] text-[#0B0A0A] font-sans font-semibold text-xs uppercase tracking-widest hover:bg-white transition-colors"
            >
              GO TO HOMEPAGE
            </Link>
            <Link
              href="/membership"
              className="py-3 bg-[#7A1F25] text-white font-sans font-semibold text-xs uppercase tracking-widest hover:bg-[#7A1F25]/80 transition-colors"
            >
              VIEW MEMBERSHIP PLANS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0A0A] text-[#F4EFE8]">
      <PageHeaderBanner
        title="MEMBER"
        accentWord="Portal"
        eyebrow="GYMNATION ATHLETE ACCESS • BHATAR, SURAT"
        subtitle="Log in to manage your active gym pass, view workout progress, and track protein orders."
        bgImage="/about_header.jpg"
        breadcrumbLabel="Log In"
      />

      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-[#161313] border-2 border-white/10 p-8 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7A1F25] via-[#F2B91D] to-[#7A1F25]" />

          <div className="mb-6 text-center">
            <h2 className="font-heading text-3xl font-bold uppercase text-white tracking-wide">
              SIGN IN
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Enter your GymNation account credentials below.
            </p>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-red-950/70 border border-red-700 text-red-200 text-xs font-mono">
              [!] {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            <div>
              <label className="block text-zinc-200 font-heading uppercase tracking-wider font-bold mb-1">
                EMAIL ADDRESS *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@gymnation.in"
                className="w-full bg-[#0B0A0A] border border-white/20 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#F2B91D] font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-zinc-200 font-heading uppercase tracking-wider font-bold mb-1">
                PASSWORD *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0B0A0A] border border-white/20 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#F2B91D] font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#F2B91D] hover:bg-yellow-400 text-[#0B0A0A] font-sans font-bold text-xs uppercase tracking-widest transition-colors shadow-lg disabled:opacity-50"
            >
              {submitting ? 'AUTHENTICATING...' : 'SIGN IN TO DASHBOARD'}
            </button>

            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-300 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors"
            >
              ⚡ AUTO-FILL DEMO MEMBER
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs font-sans">
            <span className="text-zinc-400">Don't have an account yet? </span>
            <Link href="/signup" className="text-[#F2B91D] font-bold uppercase tracking-wider hover:underline ml-1">
              Register Here &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
