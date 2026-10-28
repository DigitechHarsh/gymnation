'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';

interface SlideItem {
  id: string;
  eyebrow: string;
  heading: string;
  cursiveWord: string;
  subText: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  bgImage: string;
  rightImage: string;
  isPackshotWhiteBg?: boolean;
  offerBadgeText: string;
  offerBadgeSubtext: string;
  couponCode?: string;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: 'slide-1',
    eyebrow: "SURAT'S PREMIER FITNESS HUB • BHATAR",
    heading: 'DISCIPLINE BUILDS',
    cursiveWord: 'Freedom',
    subText: 'Stronger people. A stronger tomorrow. Experience international biomechanical strength equipment, IFBB certified trainers, and 100% genuine lab-tested nutritional supplements at our Bhatar facility.',
    ctaPrimaryLabel: 'SHOP SUPPLEMENTS',
    ctaPrimaryHref: '/products',
    ctaSecondaryLabel: 'JOIN MEMBERSHIP',
    ctaSecondaryHref: '/membership',
    bgImage: '/home_hero_bg.jpg',
    rightImage: '/home_hero_athlete.jpg',
    isPackshotWhiteBg: false,
    offerBadgeText: 'FLAT 30% OFF',
    offerBadgeSubtext: 'ON WHEY PROTEIN',
    couponCode: 'GYMNATION30',
  },
  {
    id: 'slide-2',
    eyebrow: 'PURE BIOAVAILABLE NUTRITION • 100% IMPORTED',
    heading: 'WHEY ISOLATE',
    cursiveWord: 'Mega Tub',
    subText: 'GymNation 100% Whey Isolate 10 LB (4.5 KG) mega tubs. 27g protein per scoop, 6.2g BCAAs, cold micro-filtered with DigeZyme enzymes for zero bloating. Direct Surat store pickup.',
    ctaPrimaryLabel: 'ORDER 10 LB TUB',
    ctaPrimaryHref: '/products/gold-standard-100-whey-protein',
    ctaSecondaryLabel: 'VIEW ALL SIZES',
    ctaSecondaryHref: '/products',
    bgImage: '/why_us_header.jpg',
    rightImage: '/protein_tub.jpg',
    isPackshotWhiteBg: true,
    offerBadgeText: '10 LB MEGA PACK',
    offerBadgeSubtext: '140 FULL SERVINGS',
    couponCode: 'SAVE ₹2,500',
  },
  {
    id: 'slide-3',
    eyebrow: 'PHARMACEUTICAL GRADE CREAPURE® • 200 MESH',
    heading: 'FORGE MAXIMUM',
    cursiveWord: 'Power',
    subText: 'Ultra-fine 200 mesh Micronized Creatine Monohydrate. Dissolves completely clear in 15 seconds. Maximizes intramuscular ATP regeneration, sprint speed, and explosive bench press strength.',
    ctaPrimaryLabel: 'BUY CREATINE 500G',
    ctaPrimaryHref: '/products/micronized-creatine-monohydrate',
    ctaSecondaryLabel: 'STACK WITH WHEY',
    ctaSecondaryHref: '/products',
    bgImage: '/membership_header.jpg',
    rightImage: '/creatine_tub.jpg',
    isPackshotWhiteBg: true,
    offerBadgeText: '500G PRO TUB',
    offerBadgeSubtext: '166 POWER SCOOPS',
    couponCode: 'STARTING ₹449',
  },
  {
    id: 'slide-4',
    eyebrow: 'OPEN 6:00 AM – 10:00 PM • BHATAR ROAD, SURAT',
    heading: 'CLAIM YOUR FREE',
    cursiveWord: 'Trial Pass',
    subText: 'Experience Surat’s most energetic fitness community. Get full 1-day access to our heavy free-weight zone, cardio theatre, and complimentary InBody body-composition analysis scan.',
    ctaPrimaryLabel: 'GET FREE 1-DAY PASS',
    ctaPrimaryHref: '/contact',
    ctaSecondaryLabel: 'VIEW MEMBERSHIPS',
    ctaSecondaryHref: '/membership',
    bgImage: '/about_header.jpg',
    rightImage: '/home_hero_athlete.jpg',
    isPackshotWhiteBg: false,
    offerBadgeText: 'FREE 1-DAY PASS',
    offerBadgeSubtext: 'INBODY SCAN INCLUDED',
    couponCode: 'NO COMMITMENT',
  },
];

export const HeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<SlideItem[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Attempt to load from live API
    const fetchLiveSlides = async () => {
      try {
        const res = await apiClient.get('/home');
        if (res.data?.data?.heroSlides && res.data.data.heroSlides.length > 0) {
          const apiSlides: SlideItem[] = res.data.data.heroSlides.map((s: any, idx: number) => ({
            id: s.id || `slide-${idx}`,
            eyebrow: s.eyebrow || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].eyebrow,
            heading: s.heading || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].heading,
            cursiveWord: s.cursiveWord || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].cursiveWord,
            subText: s.subText || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].subText,
            ctaPrimaryLabel: s.ctaPrimaryLabel || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].ctaPrimaryLabel,
            ctaPrimaryHref: s.ctaPrimaryHref || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].ctaPrimaryHref,
            ctaSecondaryLabel: s.ctaSecondaryLabel || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].ctaSecondaryLabel,
            ctaSecondaryHref: s.ctaSecondaryHref || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].ctaSecondaryHref,
            bgImage: s.bgMedia?.url || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].bgImage,
            rightImage: s.rightImage?.url || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].rightImage,
            isPackshotWhiteBg: s.rightImage?.url?.includes('protein') || s.rightImage?.url?.includes('creatine'),
            offerBadgeText: s.offerBadgeText || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].offerBadgeText,
            offerBadgeSubtext: s.offerBadgeSubtext || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].offerBadgeSubtext,
            couponCode: 'GYMNATION30',
          }));
          if (apiSlides.length > 0) {
            setSlides(apiSlides);
          }
        }
      } catch {
        // fallback
      }
    };
    fetchLiveSlides();
  }, []);

  // Auto-play timer (Advances every 6 seconds if not hovered)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const current = slides[currentIndex] || DEFAULT_SLIDES[0];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full lg:min-h-[calc(100vh-130px)] lg:max-h-[760px] flex flex-col justify-between overflow-hidden bg-gn-black border-b border-gn-border px-4 sm:px-8 lg:px-16 py-6 sm:py-8 group"
    >
      {/* Background Banner Image - Vibrantly visible (60-70% opacity) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={current.id + '-bg'}
        src={current.bgImage}
        alt={current.heading}
        className="absolute inset-0 w-full h-full object-cover object-center opacity-65 scale-100 transition-all duration-1000 ease-out select-none pointer-events-none"
      />

      {/* Balanced Transparent Gradients: Keeps the gym interior clearly visible while preserving text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-gn-black/85 via-gn-black/55 to-gn-black/75 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-gn-black via-transparent to-black/40 pointer-events-none" />

      {/* Subtle Atmospheric Red/Gold Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gn-maroon/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gn-gold/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Slide Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center flex-1">
        {/* Left Column: Typography, Eyebrow, CTAs (7 cols) */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 border border-gn-border bg-gn-surface/90 px-3 py-1 shadow-md backdrop-blur-sm">
            <span className="w-2 h-2 bg-gn-gold rounded-none inline-block animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-gn-gold font-bold">
              {current.eyebrow}
            </span>
          </div>

          <div className="space-y-0.5">
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-wide text-white leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              {current.heading}
            </h1>
            <div className="font-accent text-5xl sm:text-7xl lg:text-8xl text-gn-gold -mt-2 sm:-mt-3 lowercase select-none drop-shadow-[0_4px_20px_rgba(242,185,29,0.35)]">
              {current.cursiveWord}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-200 max-w-lg font-normal leading-relaxed drop-shadow-md bg-black/40 backdrop-blur-[2px] p-2.5 border border-white/10 rounded-sm">
            {current.subText}
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={current.ctaPrimaryHref}
              className="px-6 sm:px-7 py-3 bg-gn-gold hover:bg-yellow-400 text-gn-black font-sans font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg shadow-gn-gold/20"
            >
              {current.ctaPrimaryLabel}
            </Link>
            <Link
              href={current.ctaSecondaryHref}
              className="px-6 sm:px-7 py-3 bg-gn-surface/90 hover:bg-gn-black border border-gn-border hover:border-gn-gold text-white font-sans font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md backdrop-blur-sm"
            >
              {current.ctaSecondaryLabel}
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Visual / Product Packshot + Floating Offer Badge (5 cols) */}
        <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
          <div
            className={`relative w-full max-w-md aspect-[4/3] rounded-none overflow-hidden border border-gn-border shadow-2xl transition-all duration-500 ${
              current.isPackshotWhiteBg ? 'bg-white p-6 flex items-center justify-center' : 'bg-gn-surface'
            }`}
          >
            {/* Visual Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.id + '-right'}
              src={current.rightImage}
              alt={current.heading}
              className={`w-full h-full transition-transform duration-700 select-none ${
                current.isPackshotWhiteBg ? 'object-contain' : 'object-cover'
              }`}
            />
            {!current.isPackshotWhiteBg && (
              <div className="absolute inset-0 bg-gradient-to-t from-gn-black via-transparent to-transparent opacity-80" />
            )}

            {/* Overlaid Floating Offer Badge */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-gn-surface/95 border-2 border-gn-maroon p-3 sm:p-4 text-center shadow-2xl max-w-[210px] sm:max-w-[240px] backdrop-blur-sm">
              <div className="bg-gn-gold text-gn-black font-mono text-[8px] sm:text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest inline-block mb-1">
                ONLINE SPECIAL
              </div>
              <div className="font-heading text-2xl sm:text-3xl font-bold uppercase text-gn-ivory tracking-wide leading-none">
                {current.offerBadgeText}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-gn-gold font-medium mt-0.5">
                {current.offerBadgeSubtext}
              </div>
              {current.couponCode && (
                <div className="text-[9px] text-zinc-400 font-mono mt-0.5">
                  CODE: <strong className="text-white font-semibold">{current.couponCode}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slider Interactive Navigation Controls */}
      <div className="relative z-20 max-w-7xl mx-auto w-full flex items-center justify-between pt-2">
        {/* Slide Selector Indicators */}
        <div className="flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 transition-all rounded-none ${
                currentIndex === idx
                  ? 'w-10 bg-gn-gold shadow-md'
                  : 'w-3 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
          <span className="text-xs font-mono text-zinc-400 ml-2 font-bold">
            0{currentIndex + 1} / 0{slides.length}
          </span>
        </div>

        {/* Previous / Next Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            aria-label="Previous Banner"
            className="w-9 h-9 border border-white/20 bg-gn-surface/80 hover:bg-gn-gold hover:text-gn-black text-white flex items-center justify-center transition-colors font-mono font-bold"
          >
            &#x2190;
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Banner"
            className="w-9 h-9 border border-white/20 bg-gn-surface/80 hover:bg-gn-gold hover:text-gn-black text-white flex items-center justify-center transition-colors font-mono font-bold"
          >
            &#x2192;
          </button>
        </div>
      </div>

      {/* Bottom Editorial Stats Bar (Fits cleanly within viewport) */}
      <div className="relative z-10 max-w-7xl mx-auto w-full pt-3 mt-3 border-t border-gn-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-gn-ivory leading-none">04+</div>
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-1">
            SURAT HUBS
          </div>
        </div>
        <div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-gn-ivory leading-none">30+</div>
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-1">
            CERTIFIED COACHES
          </div>
        </div>
        <div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-gn-gold leading-none">05K+</div>
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-1">
            ACTIVE ATHLETES
          </div>
        </div>
        <div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-gn-ivory leading-none">10</div>
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-1">
            YEARS OF EXCELLENCE
          </div>
        </div>
      </div>
    </section>
  );
};
