import React from 'react';
import { HeroSlider } from '../components/home/HeroSlider';
import { CinematicVideoSection } from '../components/home/CinematicVideoSection';
import { ProductsSection } from '../components/home/ProductsSection';
import { AboutSection } from '../components/home/AboutSection';
import { MembershipSection } from '../components/home/MembershipSection';
import { TestimonialSection } from '../components/home/TestimonialSection';
import { FaqSection } from '../components/home/FaqSection';
import { ContactSection } from '../components/home/ContactSection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gn-black text-gn-ivory">
      {/* 1. Hero Slider Banner (Discipline Builds Freedom) */}
      <HeroSlider />

      {/* 2. Cinematic Video Section with Typewriter Overlay (video.mp4) */}
      <CinematicVideoSection />

      {/* 3. Fuel Your Performance - Curated Supplements Showcase */}
      <ProductsSection />

      {/* 4. About Us - Our Story, Vision & Journey */}
      <AboutSection />

      {/* 5. Membership Plans & Online Pass Activation */}
      <MembershipSection />

      {/* 6. Real People Real Results Testimonials */}
      <TestimonialSection />

      {/* 7. Frequently Asked Questions Accordion */}
      <FaqSection />

      {/* 8. Contact Us, Free Pass Lead Capture & Map */}
      <ContactSection />
    </main>
  );
}
