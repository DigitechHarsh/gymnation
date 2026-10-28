import React from 'react';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';
import { TestimonialSection } from '../../components/home/TestimonialSection';

export const metadata = {
  title: 'Real People Real Results – Testimonials | GymNation Surat',
  description: 'Verified transformations and athlete reviews from GymNation Surat members across Bhatar, Vesu, and Adajan.',
};

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-gn-black text-gn-ivory">
      {/* Cinematic Page Header Banner with Low-Opacity Overlay */}
      <PageHeaderBanner
        title="REAL PEOPLE"
        accentWord="Real Results"
        subtitle="Unfiltered member transformations and verified feedback from athletes training consistently on our floor."
        bgImage="/testimonials_header.jpg"
        breadcrumbLabel="Athlete Testimonials"
      />

      <div className="pb-8 pt-2">
        <TestimonialSection showHeader={false} />
      </div>
    </div>
  );
}
