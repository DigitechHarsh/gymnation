'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@gymnation.in',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await login(data.email, data.password);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Authentication failed. Please verify credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gn-black px-4 py-12">
      <div className="w-full max-w-md bg-gn-surface border border-gn-border p-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gn-maroon" />

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-widest text-gn-ivory">GYMNATION</h1>
          <div className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            THE FITNESS HUB / MANAGEMENT CONSOLE
          </div>
          <p className="text-xs text-gn-muted mt-2 font-mono">
            SECURE ACCESS FOR SUPER ADMIN, MANAGERS & STAFF
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs font-mono">
            [ERROR]: {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1.5">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="admin@gymnation.in"
              className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-sm text-gn-ivory placeholder:text-gn-muted/50 focus:outline-none focus:border-gn-maroon transition-colors"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400 font-mono">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1.5">
              PASSWORD
            </label>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••••••"
              className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-sm text-gn-ivory placeholder:text-gn-muted/50 focus:outline-none focus:border-gn-maroon transition-colors"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400 font-mono">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gn-maroon hover:bg-gn-maroon-dark text-white font-heading font-bold text-base tracking-wider uppercase border border-gn-maroon transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'AUTHENTICATING...' : 'SIGN IN TO DASHBOARD'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gn-border text-center space-y-2">
          <button
            type="button"
            onClick={() => {
              setValue('email', 'admin@gymnation.in');
              setValue('password', 'Admin@GymNation2026!');
            }}
            className="w-full py-2 bg-gn-gold/10 hover:bg-gn-gold/20 border border-gn-gold/40 text-gn-gold font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            ⚡ AUTO-FILL DEMO CREDENTIALS
          </button>
          <div className="text-[11px] font-mono text-gn-muted">
            DEFAULT SEED CREDENTIAL:
          </div>
          <div className="text-xs font-mono text-gn-gold">
            admin@gymnation.in / Admin@GymNation2026!
          </div>
        </div>
      </div>
    </div>
  );
}
