import React from 'react';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';
import { FaqSection } from '../../components/home/FaqSection';

export const metadata = {
  title: 'Frequently Asked Questions | GymNation Surat',
  description: 'Find answers to common questions about GymNation memberships, locker access, personal training, trial passes, and supplement delivery in Surat.',
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gn-black text-gn-ivory">
      {/* Cinematic Page Header Banner with Low-Opacity Overlay */}
      <PageHeaderBanner
        title="FREQUENTLY ASKED"
        accentWord="Questions"
        subtitle="Answers to common questions regarding operating hours, training protocols, membership freezes, and supplement pickups."
        bgImage="/faq_header.jpg"
        breadcrumbLabel="FAQ Desk"
      />

      <div className="pb-8 pt-2">
        <FaqSection showHeader={false} />
      </div>
    </div>
  );
}
