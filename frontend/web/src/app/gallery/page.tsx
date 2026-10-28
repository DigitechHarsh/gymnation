import React from 'react';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';
import { GallerySection } from '../../components/home/GallerySection';

export const metadata = {
  title: 'Facility Gallery & Floor Preview | GymNation Bhatar, Surat',
  description: 'Explore the high performance training floor, heavy barbell section, cardio zone, recovery suite, and athlete community at GymNation Bhatar, Surat.',
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gn-black text-gn-ivory">
      {/* Cinematic Page Header Banner with Low-Opacity Overlay */}
      <PageHeaderBanner
        title="OUR"
        accentWord="Gallery"
        subtitle="A visual tour through our heavy iron floor, high-density dumbbell section, specialized functional turf, and recovery zones."
        bgImage="/membership_header.jpg"
        breadcrumbLabel="Facility Gallery"
      />

      <div className="py-6">
        <GallerySection />
      </div>
    </div>
  );
}
