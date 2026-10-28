'use client';

import React from 'react';
import Link from 'next/link';

interface PageHeaderBannerProps {
  title: string;
  accentWord?: string;
  eyebrow?: string;
  subtitle: string;
  bgImage: string;
  breadcrumbLabel: string;
}

export const PageHeaderBanner: React.FC<PageHeaderBannerProps> = ({
  title,
  accentWord,
  eyebrow = "SURAT'S PREMIER FITNESS HUB • BHATAR",
  subtitle,
  bgImage,
  breadcrumbLabel,
}) => {
  return (
    <div className="relative w-full min-h-[280px] sm:min-h-[340px] lg:min-h-[380px] flex items-center justify-center overflow-hidden border-b border-gn-border bg-gn-black group">
      {/* Background Image - Vibrantly visible with subtle zoom */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bgImage}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 select-none"
      />

      {/* Balanced Overlay Tint: Dark enough for text legibility, light enough for the background gym image to shine through */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/65" />

      {/* Soft Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-gn-black via-transparent to-black/30 opacity-80" />

      {/* Center Content with Enhanced Drop Shadows */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 py-12 text-center space-y-3">
        {/* Breadcrumb */}
        <nav className="inline-flex items-center space-x-2 text-xs font-mono font-medium tracking-widest uppercase text-white mb-1 drop-shadow-md bg-black/60 px-3.5 py-1.5 border border-white/20 backdrop-blur-sm">
          <Link href="/" className="hover:text-gn-gold transition-colors font-medium">Home</Link>
          <span>/</span>
          <span className="text-gn-gold font-semibold">{breadcrumbLabel}</span>
        </nav>

        {/* Eyebrow */}
        <div className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-gn-gold font-semibold drop-shadow-md">
          {eyebrow}
        </div>

        {/* Main Heading with Accent Word */}
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-wider text-white leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          {title}{' '}
          {accentWord && (
            <span className="font-accent text-5xl sm:text-6xl lg:text-7xl text-gn-gold lowercase select-none drop-shadow-[0_4px_20px_rgba(242,185,29,0.3)]">
              {accentWord}
            </span>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-base text-zinc-200 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-md bg-black/50 backdrop-blur-sm p-3 border border-white/10 rounded-sm">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
