'use client';

import React, { useState } from 'react';
import { apiClient } from '../../lib/api';
import { PhoneIcon, MailIcon, MapPinIcon, WhatsAppIcon } from '../common/Icons';
import { ScrollReveal } from '../common/ScrollReveal';
import { validateName, validateIndianPhone, validateEmail, sanitizeInput } from '../../lib/validation';

interface ContactSectionProps {
  showHeader?: boolean;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ showHeader = true }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('MUSCLE BUILDING');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Bot honeypot trap check
    if (website) {
      // Silently ignore bots without exposing error details
      setFeedback({ type: 'success', message: 'Thank you! We will get in touch shortly.' });
      return;
    }

    // 1. Validate full name
    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      setFeedback({ type: 'error', message: nameCheck.error || 'Please enter a valid name.' });
      return;
    }

    // 2. Validate phone number
    const phoneCheck = validateIndianPhone(phone);
    if (!phoneCheck.isValid) {
      setFeedback({ type: 'error', message: phoneCheck.error || 'Please enter a valid 10-digit Indian phone number.' });
      return;
    }

    // 3. Validate email (if provided)
    if (email.trim()) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) {
        setFeedback({ type: 'error', message: emailCheck.error || 'Please enter a valid email address.' });
        return;
      }
    }

    try {
      setSubmitting(true);
      const cleanName = sanitizeInput(name);
      const cleanMessage = sanitizeInput(message);
      const cleanEmail = email.trim() ? sanitizeInput(email).toLowerCase() : undefined;

      const res = await apiClient.post('/leads', {
        name: cleanName,
        phone: phoneCheck.cleanPhone,
        email: cleanEmail,
        goal,
        message: cleanMessage || undefined,
        source: 'CONTACT',
      });

      if (res.data?.success) {
        setFeedback({ type: 'success', message: res.data.message || 'Trial pass booked! A trainer will call you shortly.' });
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className={`px-6 lg:px-16 bg-gn-surface border-b border-gn-border ${
        showHeader ? 'py-16 sm:py-20' : 'pt-4 pb-16 sm:pb-20'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        {showHeader && (
          <ScrollReveal effect="fade-up">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-gn-gold font-bold">
                CONNECT WITH US &bull; SCHEDULE A TRIAL
              </div>
              <h2 className="font-heading text-4xl sm:text-6xl font-bold uppercase tracking-wide text-gn-ivory mt-1">
                GET IN <span className="font-accent text-5xl sm:text-7xl text-gn-gold lowercase select-none">Touch</span>
              </h2>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mt-1">
                WE'RE HERE TO HELP YOU UNLOCK YOUR PEAK DISCIPLINE
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* 2-Column Grid: Contact Info & Lead Intake Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Cards & Google Maps (5 cols) */}
          <ScrollReveal effect="fade-left" delay={100} className="lg:col-span-5">
            <div className="space-y-6">
            <div className="p-6 bg-gn-black border border-gn-border space-y-4 text-xs font-mono">
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-4 h-4 text-[#F2B91D] mt-1 shrink-0" />
                <div>
                  <div className="text-[10px] text-[#F2B91D] uppercase tracking-widest font-semibold">FACILITY ADDRESS</div>
                  <div className="font-medium text-white uppercase mt-1 leading-relaxed text-xs sm:text-sm">
                    GymNation Floor, Bhatar Main Road, Near Bhatar Char Rasta, Surat, Gujarat 395017, India
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-gn-border/50">
                <PhoneIcon className="w-4 h-4 text-[#F2B91D] mt-1 shrink-0" />
                <div>
                  <div className="text-[10px] text-[#F2B91D] uppercase tracking-widest font-semibold">DIRECT PHONE DESK</div>
                  <a href="tel:+918511031349" className="font-semibold text-[#F2B91D] hover:underline transition-colors block mt-1 text-sm sm:text-base">
                    +91 85110 31349
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-gn-border/50">
                <WhatsAppIcon className="w-4 h-4 text-[#25D366] mt-1 shrink-0" />
                <div>
                  <div className="text-[10px] text-[#25D366] uppercase tracking-widest font-semibold">OFFICIAL WHATSAPP SUPPORT</div>
                  <a
                    href="https://wa.me/918511031349"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#25D366] hover:underline transition-colors block mt-1 text-sm sm:text-base"
                  >
                    +91 85110 31349 &bull; Chat with Reception &rarr;
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-gn-border/50">
                <MailIcon className="w-4 h-4 text-[#F2B91D] mt-1 shrink-0" />
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">EMAIL SUPPORT</div>
                  <a href="mailto:info@gymnation.in" className="font-medium text-white hover:text-[#F2B91D] transition-colors block mt-1 text-xs sm:text-sm">
                    INFO@GYMNATION.IN
                  </a>
                </div>
              </div>

              <div className="pt-3 border-t border-gn-border/50">
                <div className="text-[10px] text-[#F2B91D] uppercase tracking-widest font-semibold">OPERATING TIMINGS</div>
                <div className="text-white font-heading font-bold text-sm uppercase mt-1">
                  MONDAY – SUNDAY: 6:00 AM – 10:00 PM
                </div>
              </div>
            </div>

            {/* Google Maps Embed for Bhatar Surat */}
            <div className="h-60 w-full border border-gn-border bg-gn-black overflow-hidden relative">
              <iframe
                title="GymNation Bhatar Surat Location Map"
                src="https://maps.google.com/maps?q=Bhatar,Surat,Gujarat&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 grayscale invert contrast-125 opacity-80 hover:opacity-100 transition-opacity"
                loading="lazy"
              />
            </div>
            </div>
          </ScrollReveal>

          {/* Right Column: Lead Capture Form (7 cols) */}
          <ScrollReveal effect="fade-right" delay={200} className="lg:col-span-7">
            <div className="bg-gn-black border border-gn-border p-6 sm:p-8">
            <h3 className="font-heading text-2xl font-bold uppercase text-white tracking-wide mb-2">
              CLAIM A FREE 1-DAY GYM PASS & COUNSELING
            </h3>
            <p className="text-xs text-zinc-300 font-mono font-medium uppercase mb-6">
              FILL OUT THE FORM BELOW AND OUR SENIOR TRAINER AT BHATAR WILL CALL YOU WITHIN 2 HOURS.
            </p>

            {feedback && (
              <div
                className={`p-4 mb-6 border text-xs font-mono uppercase ${
                  feedback.type === 'success'
                    ? 'bg-green-950/60 border-green-800 text-green-300'
                    : 'bg-red-950/60 border-red-800 text-red-300'
                }`}
              >
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              {/* Honeypot field (hidden from real users, traps bots) */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.G. HARSHIL PATEL"
                    className="w-full bg-gn-surface border border-gn-border px-3.5 py-2.5 text-gn-ivory placeholder-zinc-600 focus:outline-none focus:border-gn-gold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                    PHONE NUMBER *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="E.G. 8511031349"
                    className="w-full bg-gn-surface border border-gn-border px-3.5 py-2.5 text-gn-ivory placeholder-zinc-600 focus:outline-none focus:border-gn-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="NAME@DOMAIN.COM"
                    className="w-full bg-gn-surface border border-gn-border px-3.5 py-2.5 text-gn-ivory placeholder-zinc-600 focus:outline-none focus:border-gn-gold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                    PRIMARY GOAL
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-gn-surface border border-gn-border px-3.5 py-2.5 text-gn-ivory focus:outline-none focus:border-gn-gold uppercase"
                  >
                    <option value="MUSCLE BUILDING">MUSCLE BUILDING & HYPERTROPHY</option>
                    <option value="FAT LOSS">FAT LOSS & METABOLIC CONDITIONING</option>
                    <option value="POWERLIFTING">POWERLIFTING & MAX STRENGTH</option>
                    <option value="REHABILITATION">POSTURE REHAB & MOBILITY</option>
                    <option value="GENERAL FITNESS">GENERAL CARDIO & ENDURANCE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                  SPECIFIC REQUIREMENTS / INJURY HISTORY (OPTIONAL)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="TELL US ABOUT YOUR PAST WORKOUT EXPERIENCE OR ANY QUESTIONS..."
                  className="w-full bg-gn-surface border border-gn-border px-3.5 py-2.5 text-gn-ivory placeholder-zinc-600 focus:outline-none focus:border-gn-gold resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gn-gold hover:bg-yellow-400 text-gn-black font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50"
              >
                {submitting ? 'SENDING INQUIRY...' : 'REQUEST 1-DAY PASS & COACH CONSULTATION'}
              </button>
            </form>
          </div>
        </ScrollReveal>
      </div>
      </div>
    </section>
  );
};
