'use client';

import React from 'react';
import { StarIcon } from '../common/Icons';
import { ScrollReveal } from '../common/ScrollReveal';

const TESTIMONIALS = [
  {
    name: 'Jaydeep Parmar',
    role: 'Fat Loss: 18kg in 6 Months',
    quote: 'The coaches at GymNation changed my entire approach to nutrition and heavy compound lifting. Equipment quality in Surat is unmatched.',
    rating: 5,
  },
  {
    name: 'Pooja Vaghela',
    role: 'Strength Athlete & Marathoner',
    quote: 'Cleanest gym floor I have ever trained on. The community atmosphere and genuine supplements at the front counter gave me complete peace of mind.',
    rating: 5,
  },
  {
    name: 'Ronak Shah',
    role: 'Muscle Hypertrophy: +8kg Lean Mass',
    quote: 'From InBody scans to authentic isolate protein, everything under one roof. Consistent discipline here made all the difference.',
    rating: 5,
  },
];

interface TestimonialSectionProps {
  showHeader?: boolean;
}

export const TestimonialSection: React.FC<TestimonialSectionProps> = ({ showHeader = true }) => {
  return (
    <section id="testimonials" className={`px-6 lg:px-16 bg-gn-surface border-b border-gn-border overflow-hidden ${showHeader ? 'py-20' : 'pt-4 pb-20'}`}>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header - Hidden when showHeader is false to avoid duplicate heading below overlay banner */}
        {showHeader && (
          <ScrollReveal effect="fade-up">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-gn-gold">
                PROOF OF TRANSFORMATION &bull; SURAT ATHLETES
              </div>
              <h2 className="font-heading text-4xl sm:text-6xl font-bold uppercase tracking-wide text-gn-ivory mt-1">
                REAL PEOPLE <span className="font-accent text-5xl sm:text-7xl text-gn-gold lowercase select-none">Real Results</span>
              </h2>
            </div>
          </ScrollReveal>
        )}

        {/* Testimonials Grid with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <ScrollReveal effect="fade-up" delay={idx * 150} key={idx}>
              <div
                className="p-8 bg-gn-black border border-gn-border flex flex-col justify-between space-y-6 group hover:border-gn-maroon transition-colors h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-gn-gold">
                    {[...Array(t.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 fill-gn-gold" />
                    ))}
                  </div>

                  <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-gn-border/60">
                  <div className="font-heading font-bold text-xl text-white uppercase tracking-wider">
                    {t.name}
                  </div>
                  <div className="text-xs font-mono font-medium text-gn-gold uppercase mt-0.5">
                    {t.role}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
