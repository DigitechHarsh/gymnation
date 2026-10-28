'use client';

import React from 'react';
import Link from 'next/link';
import { ScrollReveal } from '../common/ScrollReveal';

const ROWS = [
  {
    num: '01',
    title: 'EXPERT CERTIFIED TRAINERS',
    desc: 'Dedicated strength coaches and functional biomechanics specialists who tailor progressive overload routines.',
  },
  {
    num: '02',
    title: 'PREMIUM INTERNATIONAL EQUIPMENT',
    desc: 'Custom-engineered plate-loaded machines, Olympic barbells, dumbbell racks up to 60kg, and calibrated bumper plates.',
  },
  {
    num: '03',
    title: 'CLEAN, SANITIZED & SAFE FLOOR',
    desc: 'Hospital-grade sanitization protocols, high-velocity air ventilation, and high-impact rubberized safety flooring.',
  },
  {
    num: '04',
    title: 'PERSONAL NUTRITION & BODY SCAN SUPPORT',
    desc: 'Monthly InBody clinical body composition analysis with certified diet guidance to maximize muscle synthesis and fat loss.',
  },
  {
    num: '05',
    title: 'FLEXIBLE PLANS WITH ZERO HIDDEN FEES',
    desc: 'Honest transparent pricing with locker access, steam bath sessions, shower facilities, and free gym app access included.',
  },
];

interface WhyUsSectionProps {
  showHeader?: boolean;
}

export const WhyUsSection: React.FC<WhyUsSectionProps> = ({ showHeader = true }) => {
  return (
    <section id="why-us" className={`px-6 lg:px-16 bg-gn-black border-b border-gn-border overflow-hidden ${showHeader ? 'py-20' : 'pt-4 pb-20'}`}>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header - Hidden when showHeader is false to avoid duplicate heading below overlay banner */}
        {showHeader && (
          <ScrollReveal effect="fade-up">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-gn-border pb-6">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-gn-gold font-semibold">
                  THE GYMNATION ADVANTAGE
                </div>
                <h2 className="font-heading text-4xl sm:text-6xl font-bold uppercase tracking-wide text-gn-ivory mt-1">
                  WHY <span className="font-accent text-5xl sm:text-7xl text-gn-gold lowercase select-none">Gymnation</span>
                </h2>
                <div className="text-xs sm:text-sm font-mono font-medium uppercase tracking-wider text-zinc-300 mt-1">
                  IT'S MORE THAN JUST A GYM &bull; IT'S A HIGH PERFORMANCE SANCTUARY
                </div>
              </div>

              <Link
                href="/membership"
                className="px-6 py-3 bg-gn-gold hover:bg-yellow-400 text-gn-black font-sans font-bold text-xs uppercase tracking-wider transition-colors inline-block text-center shadow-lg"
              >
                JOIN NOW
              </Link>
            </div>
          </ScrollReveal>
        )}

        {/* Numbered Editorial Rows with Scroll Animation */}
        <div className="divide-y divide-gn-border border-y border-gn-border">
          {ROWS.map((row, idx) => (
            <ScrollReveal effect="fade-up" delay={idx * 100} key={row.num}>
              <div className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group hover:bg-gn-surface/50 px-4 transition-colors">
                <div className="md:col-span-2 font-heading text-4xl sm:text-5xl font-bold text-gn-maroon group-hover:text-gn-gold transition-colors">
                  {row.num}
                </div>

                <div className="md:col-span-5 font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-white group-hover:text-[#F2B91D] transition-colors">
                  {row.title}
                </div>

                <div className="md:col-span-5 text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
                  {row.desc}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
