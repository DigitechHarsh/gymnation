'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

const PHRASES = [
  'Gain Energy',
  'Boost Metabolism',
  'Build Pure Muscle',
  'Burn Stubborn Fat',
  'Elevate Human Performance',
  'Discipline Builds Freedom',
];

export const CinematicVideoSection: React.FC = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Typewriter effect
  useEffect(() => {
    const fullText = PHRASES[currentPhraseIndex];
    const typingSpeed = isDeleting ? 40 : 90;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < fullText.length) {
          setCurrentText(fullText.slice(0, currentText.length + 1));
        } else {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(fullText.slice(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % PHRASES.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIndex]);

  // Scroll-based parallax scale & opacity transition
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[75vh] sm:h-[85vh] w-full overflow-hidden bg-gn-black border-y border-gn-border flex items-center justify-center"
    >
      {/* Background Cinematic Video with smooth parallax scaling */}
      <video
        autoPlay
        muted
        loop
        playsInline
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out pointer-events-none"
        style={{
          transform: `scale(${1 + scrollProgress * 0.08})`,
        }}
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>

      {/* Low-opacity dark overlay (tuned to let the video shine through while text is crystal clear) */}
      <div className="absolute inset-0 bg-gn-black/60 backdrop-blur-[1px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-gn-black via-transparent to-gn-black/80" />

      {/* Floating Center Content with Typewriter Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 border border-gn-gold/40 bg-gn-black/70 px-4 py-1.5 backdrop-blur-sm">
          <span className="w-2 h-2 bg-gn-gold rounded-none inline-block animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-gn-gold">
            HIGH INTENSITY PERFORMANCE ZONE
          </span>
        </div>

        {/* Dynamic Typewriter Heading */}
        <div className="space-y-2">
          <div className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-zinc-300">
            ENGINEERED TO HELP YOU
          </div>
          <div className="min-h-[4rem] sm:min-h-[5.5rem] flex items-center justify-center">
            <h2 className="font-heading text-4xl sm:text-6xl md:text-7xl font-bold uppercase tracking-wide text-gn-ivory">
              <span>{currentText}</span>
              <span className="inline-block w-1.5 h-10 sm:h-14 bg-gn-gold ml-2 animate-pulse align-middle" />
            </h2>
          </div>
        </div>

        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto font-normal leading-relaxed">
          High performance training floor, international biomechanics equipment, and 100% authentic
          nutritional supplements to fuel your journey.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/membership"
            className="px-7 py-3.5 bg-gn-maroon hover:bg-gn-maroon/80 text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
          >
            EXPLORE OUR PLANS
          </Link>
          <Link
            href="/products"
            className="px-7 py-3.5 bg-gn-surface/90 hover:bg-gn-surface border border-gn-border hover:border-gn-gold text-gn-gold font-sans font-bold text-xs uppercase tracking-wider transition-colors"
          >
            EXPLORE STORE &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
};
