'use client';

import React from 'react';
import { ScrollReveal } from '../common/ScrollReveal';

interface AboutSectionProps {
  showMilestones?: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ showMilestones = false }) => {
  const milestones = [
    { year: '2016', title: 'FOUNDATION', desc: 'First training floor launched in Adajan, Surat.' },
    { year: '2019', title: 'EQUIPMENT UPGRADE', desc: 'Imported biomechanics strength lines from USA & Italy.' },
    { year: '2022', title: 'SUPPLEMENT STORE', desc: 'Authorized direct importer supplement hub opened.' },
    { year: '2026', title: 'DIGITAL HUB', desc: 'Integrated e-commerce & high performance athlete suite.' },
  ];

  const trainers = [
    { name: 'Harshil Patil', role: 'Head Strength Coach & IFBB Pro', cert: 'CSCS & ACE' },
    { name: 'Ananya Sharma', role: 'Functional & HIIT Specialist', cert: 'Kettlebell & Nutrition' },
    { name: 'Farhan Shaikh', role: 'Bodybuilding & Nutrition Coach', cert: 'ISSA Certified' },
  ];

  return (
    <section id="about" className="py-20 px-6 lg:px-16 bg-gn-surface border-b border-gn-border overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <ScrollReveal effect="fade-up">
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-mono uppercase tracking-widest text-gn-gold">
              ABOUT GYMNATION &bull; SURAT
            </div>
            <h2 className="font-heading text-4xl sm:text-6xl font-bold uppercase tracking-wide text-gn-ivory leading-none">
              OUR STORY <span className="font-accent text-5xl sm:text-7xl text-gn-gold lowercase select-none">more than a gym</span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed pt-2">
              A training ground for people who choose discipline, consistency, and a healthier lifestyle.
              We built a community that keeps showing up every day at 5:30 AM to build stronger bodies and resilient minds.
            </p>
          </div>
        </ScrollReveal>

        {/* Vision & Mission Cards with Lateral Scroll Entry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScrollReveal effect="fade-left" delay={100}>
            <div className="p-8 bg-gn-black border-l-4 border-gn-maroon border border-gn-border space-y-3 h-full">
              <div className="text-xs font-mono uppercase tracking-widest text-gn-maroon font-semibold">
                OUR VISION
              </div>
              <div className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-white">
                BUILDS STRONGER, HEALTHIER & MORE CONFIDENT COMMUNITIES
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
                To inspire thousands of fitness enthusiasts in Gujarat by providing clean, professional,
                and scientifically backed training and nutrition facilities without corporate fluff.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal effect="fade-right" delay={200}>
            <div className="p-8 bg-gn-black border-l-4 border-gn-gold border border-gn-border space-y-3 h-full">
              <div className="text-xs font-mono uppercase tracking-widest text-gn-gold font-semibold">
                OUR MISSION
              </div>
              <div className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-white">
                MAKE HIGH-PERFORMANCE TRAINING ACCESSIBLE & AUTHENTIC
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
                Equip athletes with world-class resistance machines, genuine nutritional advice,
                and certified coaches who genuinely care about proper form and injury-free progress.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Milestone Timeline (Only shown on dedicated /about page, hidden on home page) */}
        {showMilestones && (
          <div className="space-y-6">
            <ScrollReveal effect="fade-up">
              <div className="text-xs font-mono font-semibold uppercase tracking-widest text-[#F2B91D] border-b border-gn-border pb-3">
                OUR JOURNEY & MILESTONES
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {milestones.map((m, idx) => (
                <ScrollReveal effect="fade-up" delay={idx * 120} key={m.year}>
                  <div className="space-y-2 p-5 bg-gn-black border border-gn-border/70 h-full shadow-md">
                    <div className="font-heading text-4xl sm:text-5xl font-bold text-gn-gold">
                      {m.year}
                    </div>
                    <div className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                      {m.title}
                    </div>
                    <div className="text-xs text-zinc-300 font-normal leading-normal">
                      {m.desc}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}

        {/* Team Coaches */}
        <div className="space-y-6">
          <ScrollReveal effect="fade-up">
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-[#F2B91D] border-b border-gn-border pb-3">
              CERTIFIED COACHING TEAM
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {trainers.map((t, idx) => (
              <ScrollReveal effect="zoom-in" delay={idx * 150} key={t.name}>
                <div className="p-6 bg-gn-black border border-gn-border hover:border-gn-gold transition-colors space-y-1.5 h-full">
                  <div className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-wide text-white">{t.name}</div>
                  <div className="text-xs font-mono font-medium text-gn-gold uppercase">{t.role}</div>
                  <div className="text-xs font-mono font-medium text-zinc-300 uppercase pt-1">CREDENTIALS: {t.cert}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
