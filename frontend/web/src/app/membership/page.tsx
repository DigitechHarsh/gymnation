import React from 'react';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';
import { MembershipSection } from '../../components/home/MembershipSection';

export const metadata = {
  title: 'Membership Plans & Passes | GymNation Bhatar, Surat',
  description: 'Join GymNation Surat. Choose from Monthly, Quarterly, Half-Yearly, and Annual membership plans with full floor access, trainer guidance, and complimentary body scans.',
};

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-gn-black text-gn-ivory">
      {/* Cinematic Page Header Banner with Low-Opacity Overlay */}
      <PageHeaderBanner
        title="MEMBERSHIP"
        accentWord="Plans"
        subtitle="Choose the pass that fits your personal ambition. Zero hidden fees, locker facility included, and instant online pass activation."
        bgImage="/membership_header.jpg"
        breadcrumbLabel="Membership Plans"
      />

      <div>
        <MembershipSection showHeader={false} />
      </div>
    </div>
  );
}
