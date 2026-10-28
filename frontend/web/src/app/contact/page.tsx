import React from 'react';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';
import { ContactSection } from '../../components/home/ContactSection';

export const metadata = {
  title: 'Contact Us & Free Trial Pass | GymNation Bhatar, Surat',
  description: 'Visit GymNation at Bhatar, Surat. Call +91 85110 31349, WhatsApp us, or claim a complimentary 1-day gym pass and fitness counseling.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gn-black text-gn-ivory">
      {/* Cinematic Page Header Banner with Low-Opacity Overlay */}
      <PageHeaderBanner
        title="GET IN"
        accentWord="Touch"
        subtitle="Connect with our reception desk, schedule your free 1-day pass, or visit our facility located at Bhatar, Surat."
        bgImage="/contact_header.jpg"
        breadcrumbLabel="Contact Desk"
      />

      <div className="pb-8 pt-2">
        <ContactSection showHeader={false} />
      </div>
    </div>
  );
}
