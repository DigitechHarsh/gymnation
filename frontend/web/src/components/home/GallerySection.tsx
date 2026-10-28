'use client';

import React, { useState } from 'react';
import { CloseIcon } from '../common/Icons';
import { ScrollReveal } from '../common/ScrollReveal';

interface GalleryItem {
  id: string;
  category: 'ALL' | 'EQUIPMENT' | 'WORKOUTS' | 'MEMBERS' | 'EVENTS';
  title: string;
  image: string;
  span?: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    category: 'EQUIPMENT',
    title: 'Biomechanical ISO Lateral Chest Press',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80',
    span: 'col-span-1 md:col-span-2 row-span-2',
  },
  {
    id: 'g2',
    category: 'WORKOUTS',
    title: 'High Velocity Heavy Deadlift Platform',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    span: 'col-span-1 md:col-span-1 row-span-1',
  },
  {
    id: 'g3',
    category: 'MEMBERS',
    title: 'Surat Athlete Community Floor Session',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
    span: 'col-span-1 md:col-span-1 row-span-1',
  },
  {
    id: 'g4',
    category: 'EQUIPMENT',
    title: 'Calibrated Bumper Plates & Olympic Barbell Bay',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
    span: 'col-span-1 md:col-span-2 row-span-1',
  },
  {
    id: 'g5',
    category: 'EVENTS',
    title: 'Annual GymNation Powerlifting Championship',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    span: 'col-span-1 md:col-span-2 row-span-1',
  },
];

const CATEGORIES = ['ALL', 'EQUIPMENT', 'WORKOUTS', 'MEMBERS', 'EVENTS'] as const;

export const GallerySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<(typeof CATEGORIES)[number]>('ALL');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const filtered = activeTab === 'ALL'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeTab);

  return (
    <section id="gallery" className="py-20 px-6 lg:px-16 bg-gn-surface border-b border-gn-border overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header with Category Filter Buttons */}
        <ScrollReveal effect="fade-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-gn-border pb-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-gn-gold">
                FACILITY & TRAINING ATMOSPHERE
              </div>
              <h2 className="font-heading text-4xl sm:text-6xl font-bold uppercase tracking-wide text-gn-ivory mt-1">
                OUR <span className="font-accent text-5xl sm:text-7xl text-gn-gold lowercase select-none">Gallery</span>
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-3.5 py-1.5 text-xs font-sans font-semibold uppercase tracking-wider transition-colors ${
                    activeTab === cat
                      ? 'bg-gn-maroon text-white border border-gn-gold shadow-md'
                      : 'bg-gn-black border border-gn-border text-zinc-300 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Bento Grid Layout with Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[220px]">
          {filtered.map((item, idx) => (
            <ScrollReveal
              effect="zoom-in"
              delay={idx * 100}
              key={item.id}
              className={item.span || 'col-span-1 row-span-1'}
            >
              <div
                onClick={() => setLightboxItem(item)}
                className="relative overflow-hidden group cursor-pointer bg-gn-black border border-gn-border h-full w-full"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gn-black/90 via-gn-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 space-y-1">
                  <span className="text-xs font-mono font-bold uppercase text-gn-gold tracking-widest block">
                    {item.category}
                  </span>
                  <div className="font-heading font-bold text-lg sm:text-xl text-white uppercase tracking-wide line-clamp-1 drop-shadow-md">
                    {item.title}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-gn-surface border border-gn-border overflow-hidden space-y-4 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-heading text-xl uppercase font-bold text-gn-ivory">
                {lightboxItem.title}
              </span>
              <button
                onClick={() => setLightboxItem(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full overflow-hidden bg-black">
              <img
                src={lightboxItem.image}
                alt={lightboxItem.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
