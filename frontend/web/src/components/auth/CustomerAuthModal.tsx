'use client';

import React, { useState } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { CloseIcon, CheckIcon } from '../common/Icons';

export const CustomerAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    login,
    register,
  } = useCustomerAuth();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync mode with context
  React.useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleDemoFill = () => {
    if (mode === 'register') {
      setName('Harshil Patel');
      setEmail('harshil.patel@gymnation.in');
      setPhone('8511031349');
      setPassword('Member@2026!');
    } else {
      setEmail('harshil.patel@gymnation.in');
      setPassword('Member@2026!');
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'register') {
        if (!name || !email || !password) {
          setError('Please fill in all required fields.');
          setSubmitting(false);
          return;
        }
        await register(name.trim(), email.trim(), password, phone.trim());
      } else {
        if (!email || !password) {
          setError('Please provide email and password.');
          setSubmitting(false);
          return;
        }
        await login(email.trim(), password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={closeAuthModal}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#161313] border-2 border-[#7A1F25] shadow-2xl relative overflow-hidden"
      >
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#7A1F25] via-[#F2B91D] to-[#7A1F25]" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="inline-block bg-[#F2B91D]/15 text-[#F2B91D] border border-[#F2B91D]/30 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest font-semibold mb-1">
              GYMNATION MEMBER PASS
            </div>
            <h2 className="font-heading text-2xl font-bold uppercase text-white tracking-wide">
              {mode === 'register' ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK, ATHLETE'}
            </h2>
            <p className="text-xs text-zinc-300 font-sans mt-0.5">
              {mode === 'register'
                ? 'Register first to activate membership plans or track supplement orders.'
                : 'Sign in to access your membership credentials & saved stacks.'}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close Auth Modal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Register / Login */}
        <div className="grid grid-cols-2 border-b border-white/10 text-xs font-sans font-semibold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-3 text-center transition-colors ${
              mode === 'register'
                ? 'bg-[#7A1F25] text-white'
                : 'bg-[#0B0A0A] text-zinc-400 hover:text-white'
            }`}
          >
            1. REGISTER / SIGN UP
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-3 text-center transition-colors ${
              mode === 'login'
                ? 'bg-[#7A1F25] text-white'
                : 'bg-[#0B0A0A] text-zinc-400 hover:text-white'
            }`}
          >
            2. MEMBER LOG IN
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans text-xs">
          {error && (
            <div className="p-3 bg-red-950/70 border border-red-700 text-red-200 text-xs font-mono">
              [!] {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-zinc-300 font-heading uppercase tracking-wider font-bold mb-1">
                FULL NAME *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Harshil Patel"
                className="w-full bg-[#0B0A0A] border border-white/20 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#F2B91D] font-mono text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-zinc-300 font-heading uppercase tracking-wider font-bold mb-1">
              EMAIL ADDRESS *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. athlete@gymnation.in"
              className="w-full bg-[#0B0A0A] border border-white/20 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#F2B91D] font-mono text-xs"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-zinc-300 font-heading uppercase tracking-wider font-bold mb-1">
                PHONE / WHATSAPP NUMBER *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 85110 31349"
                className="w-full bg-[#0B0A0A] border border-white/20 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#F2B91D] font-mono text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-zinc-300 font-heading uppercase tracking-wider font-bold mb-1">
              PASSWORD *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#0B0A0A] border border-white/20 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#F2B91D] font-mono text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#F2B91D] hover:bg-yellow-400 text-[#0B0A0A] font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50"
          >
            {submitting
              ? 'PROCESSING...'
              : mode === 'register'
              ? 'CONFIRM & REGISTER ACCOUNT'
              : 'SIGN IN TO GYMNATION'}
          </button>

          {/* Quick Demo Fill Button */}
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-300 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            ⚡ QUICK AUTO-FILL DEMO ACCOUNT
          </button>
        </form>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#0B0A0A] border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <span>Surat GymNation Official Hub</span>
          <span>Bhatar Char Rasta, Surat</span>
        </div>
      </div>
    </div>
  );
};
