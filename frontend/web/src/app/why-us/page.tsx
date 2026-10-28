import React from 'react';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';
import { WhyUsSection } from '../../components/home/WhyUsSection';

export const metadata = {
  title: 'Why GymNation – Editorial Highlights | Surat',
  description: 'Discover why GymNation Bhatar is Surat\'s premier fitness hub: certified expert trainers, premium international machinery, certified hygienic floors, and custom programming.',
};

export default function WhyUsPage() {
  return (
    <div className="min-h-screen bg-gn-black text-gn-ivory">
      {/* Cinematic Page Header Banner with Low-Opacity Overlay */}
      <PageHeaderBanner
        title="WHY"
        accentWord="GymNation"
        subtitle="Discover what sets Surat's premier training floor apart: certified master coaches, international equipment, clean floors, and personal guidance."
        bgImage="/why_us_header.jpg"
        breadcrumbLabel="Why Us"
      />

      <div>
        <WhyUsSection showHeader={false} />
      </div>
    </div>
  );
}
