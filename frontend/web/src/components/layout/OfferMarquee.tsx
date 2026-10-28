'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

const DEFAULT_OFFERS = [
  'FLAT 25% OFF ON WHEY PROTEIN & ISOLATES',
  'USE PROMO CODE: GYMNATION25',
  'FREE EXPRESS HOME DELIVERY IN SURAT ABOVE ₹999',
  'BHATAR STORE PICKUP AVAILABLE (ZERO WAITING & FREE SHAKER)',
  '100% AUTHENTIC LAB-TESTED IMPORTER CERTIFIED SUPPLEMENTS',
  'GET FREE INBODY SCAN WITH QUARTERLY & ANNUAL MEMBERSHIPS',
];

export const OfferMarquee: React.FC = () => {
  const [offers, setOffers] = useState<string[]>(DEFAULT_OFFERS);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await apiClient.get('/home');
        if (res.data?.data?.marqueeOffers && res.data.data.marqueeOffers.length > 0) {
          const apiOffers = res.data.data.marqueeOffers
            .filter((o: any) => o.isActive !== false)
            .map((o: any) => o.text);
          if (apiOffers.length > 0) {
            setOffers(apiOffers);
          }
        }
      } catch {
        // Fallback to local storage or defaults
        try {
          const cached = localStorage.getItem('gn_marquee_offers');
          if (cached) {
            setOffers(JSON.parse(cached));
          }
        } catch {
          // keep defaults
        }
      }
    };

    fetchOffers();
  }, []);

  return (
    <div className="w-full bg-[#7A1F25] overflow-hidden border-b border-[#F2B91D]/30 py-2.5 sm:py-3 text-white select-none shadow-inner">
      <div className="animate-marquee flex items-center gap-10 whitespace-nowrap">
        {offers.concat(offers).map((offer, idx) => (
          <div key={idx} className="flex items-center gap-10">
            <span className="font-heading text-xs sm:text-sm md:text-base font-bold uppercase tracking-wider flex items-center gap-2.5 text-[#F4EFE8]">
              <span className="w-2 h-2 bg-[#F2B91D] rounded-none inline-block shadow-sm" />
              <span>{offer}</span>
            </span>
            <span className="text-[#F2B91D] font-bold text-sm">&bull;</span>
          </div>
        ))}
      </div>
    </div>
  );
};
