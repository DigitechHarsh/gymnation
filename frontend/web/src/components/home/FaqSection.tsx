'use client';

import React, { useState } from 'react';
import { ChevronDownIcon } from '../common/Icons';
import { ScrollReveal } from '../common/ScrollReveal';

const FAQS = [
  {
    q: 'What membership plans are available?',
    a: 'We offer Monthly (₹2,499), Quarterly (₹6,499), Half-Yearly (₹11,499), and Yearly (₹18,999) memberships. Every plan includes full access to strength and cardio lines, locker rooms, steam bath sessions, and certified floor coach guidance.',
  },
  {
    q: 'What are the gym operating timings in Surat?',
    a: 'GymNation is open Monday through Saturday from 5:30 AM to 10:30 PM. On Sundays, we are open for morning sessions from 6:00 AM to 12:00 PM.',
  },
  {
    q: 'Are your nutritional supplements 100% genuine and verified?',
    a: 'Yes, absolutely. We are direct authorized stockists for certified Indian and international brands (Optimum Nutrition, MuscleBlaze, Dymatize, etc.). Every tub comes with an official importer scratch hologram code for instant authenticity verification.',
  },
  {
    q: 'Can I freeze or pause my membership in case of travel or medical reasons?',
    a: 'Yes, members on Half-Yearly and Yearly plans can request a complimentary membership freeze of up to 30 days by notifying the front desk.',
  },
  {
    q: 'How fast is local supplement delivery within Surat?',
    a: 'We provide same-day or 24-hour express courier delivery across all Surat pincodes (395xxx). Additionally, you can choose Free Store Pickup at our Bhatar reception during gym hours.',
  },
  {
    q: 'Do you offer personal training and clinical body scans?',
    a: 'Yes, our certified coaches offer 1-on-1 personal training packages. We also provide monthly InBody medical body composition scans to analyze muscle mass, visceral fat, and water retention.',
  },
];

interface FaqSectionProps {
  showHeader?: boolean;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ showHeader = true }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className={`px-6 lg:px-16 bg-gn-black border-b border-gn-border overflow-hidden ${
        showHeader ? 'py-20' : 'pt-4 pb-20'
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        {showHeader && (
          <ScrollReveal effect="fade-up">
            <div className="text-center space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-gn-gold">
                CLARITY & TRANSPARENCY
              </div>
              <h2 className="font-heading text-4xl sm:text-6xl font-bold uppercase tracking-wide text-gn-ivory">
                FREQUENTLY <span className="font-accent text-5xl sm:text-7xl text-gn-gold lowercase select-none">Asked Questions</span>
              </h2>
            </div>
          </ScrollReveal>
        )}

        {/* Accordion Container with Scroll Reveal */}
        <div className="divide-y divide-gn-border border-y border-gn-border">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <ScrollReveal effect="fade-up" delay={idx * 80} key={idx}>
                <div className="transition-colors">
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full py-5 px-3 flex items-center justify-between text-left group"
                  >
                    <span className="font-heading text-base sm:text-lg font-bold uppercase tracking-wide text-white group-hover:text-gn-gold transition-colors">
                      {item.q}
                    </span>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-gn-gold shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-3 pb-6 text-sm sm:text-base text-zinc-300 font-normal leading-relaxed animate-fadeIn">
                      {item.a}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
