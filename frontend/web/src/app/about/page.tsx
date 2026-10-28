import React from 'react';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';
import { AboutSection } from '../../components/home/AboutSection';

export const metadata = {
  title: 'Our Story – About Us | GymNation Bhatar, Surat',
  description: 'Learn about GymNation Surat – established in 2016 at Bhatar. Our vision, mission, coaching philosophy, and elite bodybuilding coaches.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gn-black text-gn-ivory">
      {/* Cinematic Page Header Banner with Low-Opacity Overlay */}
      <PageHeaderBanner
        title="OUR"
        accentWord="Story"
        subtitle="More than a gym — a breeding ground for discipline, strength, and community established in Surat since 2016."
        bgImage="/about_header.jpg"
        breadcrumbLabel="About Us"
      />

      <div className="py-6">
        <AboutSection showMilestones={true} />
      </div>
    </div>
  );
}
