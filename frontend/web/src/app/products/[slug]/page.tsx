'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import {
  CartIcon,
  StarIcon,
  CheckIcon,
  MapPinIcon,
  PhoneIcon,
  HeartIcon,
} from '../../../components/common/Icons';

interface WeightOption {
  label: string;
  price: number;
  originalPrice: number;
  servings: string;
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  badge: string;
  category: string;
  description: string;
  images: string[];
  flavors: string[];
  weights: WeightOption[];
  servingSize: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  nutritionFacts: { label: string; amount: string; dailyValue?: string }[];
  ingredients: string;
  usageInstructions: string;
}

const CATALOG_DATA: Record<string, ProductDetail> = {
  'gold-standard-100-whey-protein': {
    id: 'prod-whey-10lb',
    name: 'GymNation 100% Whey Isolate 10 LB (4.5 KG Mega Tub)',
    slug: 'gold-standard-100-whey-protein',
    subtitle: 'Cross-Flow Cold Micro-Filtered Whey Protein Isolate • 27g Protein • Ultra-Low Carb • Zero Added Sugar',
    badge: '10 LB MEGA TUB',
    category: 'WHEY PROTEIN',
    description: 'Engineered specifically for serious bodybuilders and athletes training in Surat. GymNation Whey Isolate delivers 27 grams of purest ultra-filtered whey protein isolate per serving with 6.2g naturally occurring BCAAs. Sourced from grass-fed dairy, cold-processed to preserve fragile immunoglobulins, and infused with patented DigeZyme® multi-enzyme complex for 100% bloat-free rapid digestion.',
    images: ['/protein_tub.jpg'],
    flavors: ['Double Rich Chocolate', 'Belgian Cocoa', 'Vanilla Bean', 'Kesar Pista Badam', 'Mocha Cappuccino'],
    weights: [
      { label: '10 LB (4.5 KG) Mega Tub', price: 7499, originalPrice: 9999, servings: '140 Servings' },
      { label: '4 KG (8.8 LB) Tub', price: 6499, originalPrice: 8499, servings: '125 Servings' },
      { label: '2 KG (4.4 LB) Tub', price: 3499, originalPrice: 4999, servings: '62 Servings' },
      { label: '1 KG (2.2 LB) Tub', price: 1999, originalPrice: 2799, servings: '31 Servings' },
    ],
    servingSize: '1 Rounded Scoop (32g)',
    rating: 4.9,
    reviewsCount: 168,
    stock: 24,
    nutritionFacts: [
      { label: 'Energy / Calories', amount: '120 kcal', dailyValue: '6%' },
      { label: 'Protein (Pure Whey Isolate)', amount: '27.0 g', dailyValue: '54%' },
      { label: 'BCAAs (Naturally Occurring)', amount: '6.2 g', dailyValue: '-' },
      { label: 'Glutamine & Precursors', amount: '4.9 g', dailyValue: '-' },
      { label: 'Total Carbohydrates', amount: '1.0 g', dailyValue: '<1%' },
      { label: 'Added Sugars', amount: '0.0 g', dailyValue: '0%' },
      { label: 'Total Fat', amount: '0.5 g', dailyValue: '1%' },
      { label: 'DigeZyme® Multi-Enzyme', amount: '50 mg', dailyValue: '-' },
    ],
    ingredients: 'Cross-Flow Cold Micro-Filtered Whey Protein Isolate 90%, Alkalized Dutch Cocoa Powder, DigeZyme® Multi-Enzyme Blend (Amylase, Protease, Cellulase, Lactase, Lipase), Natural & Nature Identical Flavors, Sunflower Lecithin (for instant dispersion), Sucralose (INS 955).',
    usageInstructions: 'Mix 1 rounded scoop (32g) with 200–250 ml of chilled water or low-fat milk in your GymNation shaker. Shake vigorously for 25–30 seconds. Best consumed within 30 minutes post-workout or first thing in the morning.',
  },
  'micronized-creatine-monohydrate': {
    id: 'prod-creatine-500g',
    name: 'GymNation Micronized Creatine Monohydrate 500g (200 Mesh)',
    slug: 'micronized-creatine-monohydrate',
    subtitle: '100% Pure Creapure® Grade Micronized Creatine • Zero Sugar • Instant ATP Cellular Energy & Volumization',
    badge: '500G PRO TUB',
    category: 'CREATINE',
    description: 'Unlock maximum explosive strength, heavy bench press numbers, and high sprint power. GymNation Micronized Creatine is ground to an ultra-fine 200 mesh pharmaceutical specification, ensuring zero grittiness, instant solubility in cold water, and rapid intramuscular absorption without stomach discomfort.',
    images: ['/creatine_tub.jpg'],
    flavors: ['Pure Unflavored', 'Tangy Orange Blast', 'Watermelon Rush', 'Blueberry Lemonade'],
    weights: [
      { label: '500g Pro Tub (166 Servings)', price: 1299, originalPrice: 1799, servings: '166 Servings' },
      { label: '250g Compact Tub (83 Servings)', price: 799, originalPrice: 1199, servings: '83 Servings' },
      { label: '100g Trial Pack (33 Servings)', price: 449, originalPrice: 649, servings: '33 Servings' },
    ],
    servingSize: '1 Level Scoop (3g)',
    rating: 4.9,
    reviewsCount: 112,
    stock: 48,
    nutritionFacts: [
      { label: 'Pure Micronized Creatine Monohydrate (200 Mesh)', amount: '3,000 mg', dailyValue: '-' },
      { label: 'Energy', amount: '0 kcal', dailyValue: '0%' },
      { label: 'Total Carbohydrates', amount: '0 g', dailyValue: '0%' },
      { label: 'Added Sugars', amount: '0 g', dailyValue: '0%' },
      { label: 'Total Fat', amount: '0 g', dailyValue: '0%' },
    ],
    ingredients: '100% Pure Pharmaceutical Grade Micronized Creatine Monohydrate (200 Mesh). Zero fillers, zero binders, zero artificial colors.',
    usageInstructions: 'Consume 1 scoop (3g) daily mixed with 250ml of water, fruit juice, or your post-workout protein shake. Drink at least 3 to 4 liters of water throughout the day for optimal cellular hydration.',
  },
};

interface SuggestedProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  pricePaise: number;
  mrpPaise: number;
  badge?: string;
  image: string;
  rating: number;
  reviewsCount: number;
  defaultVariantId: string;
  defaultSku: string;
}

const ALL_SUGGESTED_PRODUCTS: SuggestedProduct[] = [
  {
    id: 'prod_1',
    name: 'GymNation 100% Whey Isolate 10 LB (4.5 KG Mega Tub)',
    slug: 'gold-standard-100-whey-protein',
    category: 'WHEY PROTEIN',
    pricePaise: 749900,
    mrpPaise: 999900,
    badge: '10 LB MEGA TUB',
    image: '/protein_tub.jpg',
    rating: 4.9,
    reviewsCount: 168,
    defaultVariantId: 'var_whey_10lb',
    defaultSku: 'GN-WHEY-ISO-10LB',
  },
  {
    id: 'prod_2',
    name: 'GymNation 100% Pure Micronized Creatine 500g (200 Mesh)',
    slug: 'micronized-creatine-monohydrate',
    category: 'CREATINE',
    pricePaise: 129900,
    mrpPaise: 179900,
    badge: '500G PRO TUB',
    image: '/creatine_tub.jpg',
    rating: 4.9,
    reviewsCount: 112,
    defaultVariantId: 'var_creatine_500g',
    defaultSku: 'GN-CREATINE-500G',
  },
  {
    id: 'prod_3',
    name: 'GymNation 100% Whey Isolate 1 KG (Double Rich Chocolate)',
    slug: 'gold-standard-100-whey-protein',
    category: 'WHEY PROTEIN',
    pricePaise: 349900,
    mrpPaise: 449900,
    badge: 'BESTSELLER',
    image: '/protein_tub.jpg',
    rating: 4.8,
    reviewsCount: 94,
    defaultVariantId: 'var_whey_1kg',
    defaultSku: 'GN-WHEY-ISO-1KG',
  },
  {
    id: 'prod_4',
    name: 'GymNation Micronized Creatine 250g (Compact Tub)',
    slug: 'micronized-creatine-monohydrate',
    category: 'CREATINE',
    pricePaise: 79900,
    mrpPaise: 119900,
    badge: '200 MESH',
    image: '/creatine_tub.jpg',
    rating: 4.9,
    reviewsCount: 63,
    defaultVariantId: 'var_creatine_250g',
    defaultSku: 'GN-CREATINE-250G',
  },
  {
    id: 'prod_5',
    name: 'Pre-Workout Explosive Nitro 300g (Watermelon Blast)',
    slug: 'gold-standard-100-whey-protein',
    category: 'PRE-WORKOUT',
    pricePaise: 159900,
    mrpPaise: 219900,
    badge: 'NEW FORMULA',
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 79,
    defaultVariantId: 'var_pre_1',
    defaultSku: 'GN-PRE-NITRO-300G',
  },
  {
    id: 'prod_6',
    name: 'Anabolic Mass Gainer 5 KG (Chocolate Fudge)',
    slug: 'gold-standard-100-whey-protein',
    category: 'MASS GAINER',
    pricePaise: 389900,
    mrpPaise: 499900,
    badge: 'HEAVY BULK',
    image: '/protein_tub.jpg',
    rating: 4.7,
    reviewsCount: 52,
    defaultVariantId: 'var_mass_5kg',
    defaultSku: 'GN-MASS-5KG',
  },
  {
    id: 'prod_7',
    name: 'GymNation Heavy-Duty Stainless Steel Shaker Bottle 750ml',
    slug: 'gold-standard-100-whey-protein',
    category: 'GEAR',
    pricePaise: 59900,
    mrpPaise: 89900,
    badge: 'ACCESSORY',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 145,
    defaultVariantId: 'var_shaker_1',
    defaultSku: 'GN-SHAKER-STEEL',
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'gold-standard-100-whey-protein';
  const { addItem, setIsDrawerOpen, setIsCheckoutOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Find product by slug or fallback
  const product =
    CATALOG_DATA[slug] ||
    (slug.includes('creatine')
      ? CATALOG_DATA['micronized-creatine-monohydrate']
      : CATALOG_DATA['gold-standard-100-whey-protein']);

  const [selectedWeightIndex, setSelectedWeightIndex] = useState<number>(0);
  const [selectedFlavor, setSelectedFlavor] = useState<string>(product.flavors[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'nutrition' | 'reviews' | 'surat'>('desc');
  const [pincode, setPincode] = useState<string>('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  // Filter out the current active product and take exactly 5 distinct suggested products
  const suggestedProducts = ALL_SUGGESTED_PRODUCTS.filter((p) => {
    if (slug.includes('creatine')) {
      return p.id !== 'prod_2';
    }
    return p.id !== 'prod_1';
  }).slice(0, 5);

  useEffect(() => {
    setSelectedWeightIndex(0);
    setSelectedFlavor(product.flavors[0]);
    setQuantity(1);
  }, [slug, product]);

  const currentWeight = product.weights[selectedWeightIndex] || product.weights[0];
  const discountPercent = Math.round(
    ((currentWeight.originalPrice - currentWeight.price) / currentWeight.originalPrice) * 100
  );

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    if (pincode.startsWith('395') || pincode.startsWith('394')) {
      setPincodeStatus('⚡ Available in Surat (Bhatar/Vesu): Same-Day Delivery or Store Pickup within 2 hours!');
    } else {
      setPincodeStatus('✓ Delivery available across India via Shiprocket Express Air (2-4 business days).');
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedFlavor}-${currentWeight.label}`,
      productId: product.id,
      name: `${product.name} - ${currentWeight.label}`,
      variantLabel: `${selectedFlavor} • ${currentWeight.label}`,
      pricePaise: currentWeight.price * 100,
      image: product.images[0],
      qty: quantity,
      sku: `${product.slug.toUpperCase()}-${selectedFlavor.slice(0, 3).toUpperCase()}`,
      weightGrams: currentWeight.label.includes('10 LB') ? 4500 : 1000,
    });
    setIsDrawerOpen(true);
  };

  const handleBuyNow = () => {
    addItem({
      id: `${product.id}-${selectedFlavor}-${currentWeight.label}`,
      productId: product.id,
      name: `${product.name} - ${currentWeight.label}`,
      variantLabel: `${selectedFlavor} • ${currentWeight.label}`,
      pricePaise: currentWeight.price * 100,
      image: product.images[0],
      qty: quantity,
      sku: `${product.slug.toUpperCase()}-${selectedFlavor.slice(0, 3).toUpperCase()}`,
      weightGrams: currentWeight.label.includes('10 LB') ? 4500 : 1000,
    });
    setIsCheckoutOpen(true);
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      productId: product.id,
      name: `${product.name} (${currentWeight.label})`,
      slug: product.slug,
      pricePaise: currentWeight.price * 100,
      mrpPaise: currentWeight.originalPrice * 100,
      image: product.images[0],
      category: product.category,
      badge: product.badge,
      defaultVariantId: `${product.id}-${selectedFlavor}-${currentWeight.label}`,
      defaultSku: `${product.slug.toUpperCase()}-${selectedFlavor.slice(0, 3).toUpperCase()}`,
    });
  };

  return (
    <div className="bg-[#0B0A0A] text-[#F4EFE8] min-h-screen py-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-white/50">
          <Link href="/" className="hover:text-[#F2B91D] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#F2B91D] transition-colors">Products</Link>
          <span>/</span>
          <span className="text-[#F2B91D] truncate font-bold">{product.name}</span>
        </nav>

        {/* 2-Column Product Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Clean Solid White Studio Packshot Presentation */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full bg-white rounded-sm border border-white/20 p-8 sm:p-12 shadow-2xl flex items-center justify-center overflow-hidden group">
              {/* Packshot Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 select-none"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 bg-[#7A1F25] text-white text-[11px] font-heading font-bold tracking-widest px-3 py-1 uppercase shadow-md">
                {product.badge}
              </div>
              <div className="absolute top-4 right-4 bg-[#0B0A0A] text-[#F2B91D] border border-[#F2B91D]/40 text-xs font-mono font-medium px-3 py-1 shadow-md">
                SAVE {discountPercent}%
              </div>

              {/* Bottom Watermark */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                <span>100% Genuine Lab Tested</span>
                <span>Bhatar, Surat Official Hub</span>
              </div>
            </div>

            {/* Thumbnail Preview strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="border-2 border-[#F2B91D] bg-white p-2 rounded-sm aspect-video flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.images[0]} alt="Primary View" className="h-full object-contain" />
              </div>
              <div className="border border-white/10 bg-[#161313] p-3 rounded-sm flex flex-col justify-center text-center">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">FSSAI Certified</span>
                <span className="text-xs font-heading text-[#F2B91D] font-bold">10723026000412</span>
              </div>
              <div className="border border-white/10 bg-[#161313] p-3 rounded-sm flex flex-col justify-center text-center">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Surat Pickup</span>
                <span className="text-xs font-heading text-emerald-400 font-bold">READY IN 2 HRS</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Pricing, Flavor & Weight Selectors, CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Brand Tag */}
              <div className="inline-flex items-center gap-2 bg-[#F2B91D]/10 text-[#F2B91D] border border-[#F2B91D]/30 px-3 py-1 text-[10px] tracking-widest font-heading font-semibold uppercase mb-3">
                <span>GYMNATION PERFORMANCE LABS</span>
                <span>&bull;</span>
                <span>BHATAR, SURAT</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wide text-white font-bold leading-tight">
                {product.name}
              </h1>
              <p className="text-white/70 text-xs sm:text-sm font-sans mt-2 leading-relaxed">
                {product.subtitle}
              </p>

              {/* Rating & Stock Counter */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pb-4 border-b border-white/10 text-xs font-mono">
                <div className="flex items-center text-[#F2B91D] space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-white font-bold ml-1.5">{product.rating}</span>
                </div>
                <span className="text-white/30">|</span>
                <span className="text-white/60">{product.reviewsCount} Verified Gym Members</span>
                <span className="text-white/30">|</span>
                <span className="text-emerald-400 font-medium uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  IN STOCK ({product.stock} Units Left in Surat Hub)
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[#161313] border border-white/10 space-y-1">
              <div className="flex items-baseline space-x-4">
                <span className="font-heading text-4xl sm:text-5xl font-bold text-[#F2B91D] tracking-normal">
                  ₹{currentWeight.price.toLocaleString('en-IN')}
                </span>
                <span className="text-lg font-mono text-white/40 line-through">
                  ₹{currentWeight.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="bg-[#7A1F25] text-white text-xs font-heading font-bold px-2.5 py-0.5 tracking-wider uppercase">
                  SAVE ₹{(currentWeight.originalPrice - currentWeight.price).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 pt-1">
                Inclusive of all taxes (18% GST CGST/SGST). Free Surat city shipping or instant pickup at Bhatar.
              </p>
            </div>

            {/* Container Size / Weight Options (Dynamic Pricing) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-heading uppercase tracking-widest text-white/80">
                <span>Select Tub Size / Weight:</span>
                <span className="text-[#F2B91D] font-mono font-bold">{currentWeight.servings}</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {product.weights.map((w, idx) => (
                  <button
                    key={w.label}
                    onClick={() => setSelectedWeightIndex(idx)}
                    className={`p-3 text-left border transition-all flex flex-col justify-between ${
                      selectedWeightIndex === idx
                        ? 'border-[#F2B91D] bg-[#F2B91D]/15 text-white shadow-md'
                        : 'border-white/10 bg-[#161313] text-white/70 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <span className="font-heading text-xs uppercase font-bold tracking-wider">{w.label}</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-mono text-sm font-bold text-[#F2B91D]">
                        ₹{w.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 line-through">
                        ₹{w.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Flavor Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-heading uppercase tracking-widest text-white/80">
                <span>Select Flavor:</span>
                <span className="text-[#F2B91D] font-bold">{selectedFlavor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.flavors.map((flavor) => (
                  <button
                    key={flavor}
                    onClick={() => setSelectedFlavor(flavor)}
                    className={`px-3.5 py-2 text-xs font-heading tracking-wider uppercase border transition-all ${
                      selectedFlavor === flavor
                        ? 'border-[#F2B91D] bg-[#F2B91D] text-[#0B0A0A] font-bold'
                        : 'border-white/10 bg-[#161313] text-white/70 hover:border-white/30 hover:text-white font-medium'
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper & Main CTAs */}
            <div className="space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:gap-3 pt-2">
              {/* Row 1 on Mobile: Stepper + Wishlist */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                {/* Stepper */}
                <div className="flex-1 sm:w-36 flex items-center border border-white/20 bg-[#161313] h-12 justify-between px-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-white/60 hover:text-white text-lg font-mono font-medium w-8 text-center transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-bold text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="text-white/60 hover:text-white text-lg font-mono font-medium w-8 text-center transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Wishlist Button on Mobile (paired next to Stepper) */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`sm:hidden h-12 w-12 shrink-0 border flex items-center justify-center transition-all ${
                    isInWishlist(product.id)
                      ? 'bg-red-600 border-red-500 text-white shadow-md'
                      : 'bg-[#161313] border-white/20 text-white hover:border-red-500 hover:text-red-400'
                  }`}
                  title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  aria-label="Wishlist"
                >
                  <HeartIcon className="w-5 h-5" filled={isInWishlist(product.id)} />
                </button>
              </div>

              {/* Action Buttons: 2-column grid on Mobile, flex-1 inline on Desktop */}
              <div className="grid grid-cols-2 sm:flex sm:flex-1 gap-2.5 sm:gap-3 w-full">
                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-transparent border-2 border-[#F2B91D] text-[#F2B91D] hover:bg-[#F2B91D] hover:text-[#0B0A0A] font-sans text-[11px] sm:text-xs md:text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-[0.99] px-2 sm:px-4"
                >
                  <CartIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">ADD TO CART</span>
                </button>

                {/* Instant Checkout */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 h-12 bg-[#7A1F25] hover:bg-[#92262D] text-white font-sans text-[11px] sm:text-xs md:text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg active:scale-[0.99] px-2 sm:px-4"
                >
                  <span className="truncate">INSTANT CHECKOUT</span>
                </button>
              </div>

              {/* Wishlist Button on Desktop (inline at end of row) */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`hidden sm:flex h-12 w-12 shrink-0 border items-center justify-center transition-all ${
                  isInWishlist(product.id)
                    ? 'bg-red-600 border-red-500 text-white shadow-md'
                    : 'bg-[#161313] border-white/20 text-white hover:border-red-500 hover:text-red-400'
                }`}
                title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label="Wishlist"
              >
                <HeartIcon className="w-5 h-5" filled={isInWishlist(product.id)} />
              </button>
            </div>

            {/* Surat PIN Code & Store Pickup Checker */}
            <div className="bg-[#161313] border border-white/10 p-4 space-y-2">
              <span className="block text-xs font-heading uppercase tracking-widest text-white/80 font-bold">
                Check Surat Same-Day Delivery / Bhatar Hub Pickup:
              </span>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode (e.g. 395007 / 395017)"
                  className="flex-1 bg-[#0B0A0A] border border-white/20 text-white text-xs px-3 py-2 font-mono focus:outline-none focus:border-[#F2B91D]"
                />
                <button
                  type="submit"
                  className="bg-white/10 hover:bg-[#F2B91D] hover:text-[#0B0A0A] text-white text-xs font-heading uppercase tracking-wider px-4 py-2 font-bold transition-colors"
                >
                  Check
                </button>
              </form>
              {pincodeStatus && (
                <p className="text-xs font-mono text-[#F2B91D] pt-1 leading-relaxed">
                  {pincodeStatus}
                </p>
              )}
            </div>

            {/* Authentic Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
              <div className="p-2.5 bg-[#161313]/70 border border-white/5">
                <span className="block text-[#F2B91D] font-heading text-xs uppercase font-bold">100% Genuine</span>
                <span className="text-[10px] text-white/40 font-mono">Authenticity QR Sealed</span>
              </div>
              <div className="p-2.5 bg-[#161313]/70 border border-white/5">
                <span className="block text-[#F2B91D] font-heading text-xs uppercase font-bold">Bhatar Pickup</span>
                <span className="text-[10px] text-white/40 font-mono">Collect in 2 Hours</span>
              </div>
              <div className="p-2.5 bg-[#161313]/70 border border-white/5">
                <span className="block text-[#F2B91D] font-heading text-xs uppercase font-bold">Free Shipping</span>
                <span className="text-[10px] text-white/40 font-mono">On Orders Above ₹999</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Section: Overview, Nutrition Facts, Verified Reviews, Surat Shipping */}
        <div className="border border-white/10 bg-[#161313] mt-12">
          {/* Tab Headers */}
          <div className="flex border-b border-white/10 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('desc')}
              className={`px-6 py-4 font-heading text-xs sm:text-sm uppercase tracking-wider font-bold shrink-0 transition-colors ${
                activeTab === 'desc'
                  ? 'border-b-2 border-[#F2B91D] text-[#F2B91D] bg-[#0B0A0A]/40'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              PRODUCT DETAILS
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`px-6 py-4 font-heading text-xs sm:text-sm uppercase tracking-wider font-bold shrink-0 transition-colors ${
                activeTab === 'nutrition'
                  ? 'border-b-2 border-[#F2B91D] text-[#F2B91D] bg-[#0B0A0A]/40'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              NUTRITION FACTS & LAB TEST
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 font-heading text-xs sm:text-sm uppercase tracking-wider font-bold shrink-0 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-[#F2B91D] text-[#F2B91D] bg-[#0B0A0A]/40'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              REVIEWS ({product.reviewsCount})
            </button>
            <button
              onClick={() => setActiveTab('surat')}
              className={`px-6 py-4 font-heading text-xs sm:text-sm uppercase tracking-wider font-bold shrink-0 transition-colors ${
                activeTab === 'surat'
                  ? 'border-b-2 border-[#F2B91D] text-[#F2B91D] bg-[#0B0A0A]/40'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              SURAT STORE PICKUP & SHIPPING
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-6 md:p-8 font-sans">
            {activeTab === 'desc' && (
              <div className="max-w-4xl space-y-6">
                <div>
                  <h3 className="font-heading text-lg uppercase tracking-wider text-[#F2B91D] mb-2 font-bold">
                    Formula Specification
                  </h3>
                  <p className="text-white/70 leading-relaxed text-sm">
                    {product.description}
                  </p>
                </div>
                <div>
                  <h4 className="font-heading text-sm uppercase tracking-wider text-white mb-2 font-bold">
                    Suggested Usage & Optimal Timing:
                  </h4>
                  <p className="text-white/70 leading-relaxed text-xs sm:text-sm font-mono bg-[#0B0A0A] p-4 border border-white/10">
                    {product.usageInstructions}
                  </p>
                </div>
                <div>
                  <h4 className="font-heading text-sm uppercase tracking-wider text-white mb-2 font-bold">
                    Active Ingredients & Composition:
                  </h4>
                  <p className="text-white/60 leading-relaxed text-xs font-mono">
                    {product.ingredients}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="max-w-2xl bg-[#0B0A0A] p-6 border border-white/20">
                <h3 className="font-heading text-2xl uppercase tracking-wider text-white mb-1 border-b-4 border-white pb-1 font-bold">
                  Nutrition Facts
                </h3>
                <div className="flex justify-between text-xs font-mono text-white/70 py-1.5 border-b border-white/30">
                  <span>Serving Size: {product.servingSize}</span>
                  <span>Servings Per Tub: {currentWeight.servings}</span>
                </div>
                <div className="py-2 border-b-8 border-white">
                  <span className="text-xs font-heading font-bold uppercase text-white/60 block">
                    Amount Per Serving
                  </span>
                </div>
                <table className="w-full text-xs font-mono mt-2">
                  <tbody>
                    {product.nutritionFacts.map((item, idx) => (
                      <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-2.5 font-sans font-medium text-white">{item.label}</td>
                        <td className="py-2.5 text-right font-mono text-[#F2B91D] font-bold">{item.amount}</td>
                        {item.dailyValue && (
                          <td className="py-2.5 text-right text-white/40 pl-4">{item.dailyValue}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[10px] font-mono text-white/40 mt-4 leading-normal">
                  * Percent Daily Values are based on a 2,000 calorie diet. Lab batch tested for zero heavy metals, zero protein spiking, and 100% label accuracy.
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-4xl space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div>
                    <h3 className="font-heading text-2xl uppercase text-white tracking-wide font-bold">
                      Member Verified Reviews
                    </h3>
                    <p className="text-xs text-white/50 font-mono">Based on verified purchases from Surat and nationwide</p>
                  </div>
                  <div className="text-right">
                    <span className="font-heading text-3xl font-bold text-[#F2B91D]">{product.rating} / 5</span>
                    <div className="flex text-[#F2B91D] justify-end">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Kavita Patel', location: 'Bhatar, Surat', rating: 5, date: '14 Oct 2026', comment: 'Ordered the 10 lb mega tub and picked it up directly at GymNation Bhatar. Mixability is 10/10 with cold water. No bloating at all!' },
                    { name: 'Rajesh Varma', location: 'Vesu, Surat', rating: 5, date: '02 Oct 2026', comment: 'Legit authentic product with batch verification code. Best whey protein in Gujarat without doubt. Double rich chocolate is insane.' },
                    { name: 'Sameer Sheikh', location: 'Adajan, Surat', rating: 5, date: '22 Sep 2026', comment: 'Creatine 500g tub is ultra fine 200 mesh. Dissolves completely clear in 15 seconds. Immediate strength boost in week 2.' }
                  ].map((rev, i) => (
                    <div key={i} className="p-4 bg-[#0B0A0A] border border-white/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-heading uppercase tracking-wider text-sm font-bold text-white">
                          {rev.name} <span className="text-[11px] text-white/40 font-mono font-normal">({rev.location})</span>
                        </span>
                        <span className="text-[11px] font-mono text-white/40">{rev.date}</span>
                      </div>
                      <div className="flex text-[#F2B91D] mb-2">
                        {[...Array(rev.rating)].map((_, s) => (
                          <StarIcon key={s} className="w-3 3 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-white/70 font-sans leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'surat' && (
              <div className="max-w-4xl space-y-4 text-xs font-mono text-white/70 leading-relaxed">
                <div className="p-4 bg-[#0B0A0A] border border-white/10">
                  <h4 className="font-heading text-sm uppercase tracking-wider text-[#F2B91D] mb-1 font-bold">
                    Surat City Same-Day Delivery (0–24 Hours)
                  </h4>
                  <p>All orders placed in Surat pincodes (395001 – 395017) are dispatched promptly from our Bhatar central gym facility. Express same-day rider delivery available on orders placed before 4:00 PM.</p>
                </div>
                <div className="p-4 bg-[#0B0A0A] border border-white/10">
                  <h4 className="font-heading text-sm uppercase tracking-wider text-[#F2B91D] mb-1 font-bold">
                    Free In-Store Pickup at Bhatar, Surat
                  </h4>
                  <p>Collect your supplement tub directly from GymNation Front Desk, Bhatar, Surat (Opp. Central Point, Bhatar Road). Open 6:00 AM – 10:00 PM daily. Bring your order confirmation SMS or WhatsApp.</p>
                </div>
                <div className="p-4 bg-[#0B0A0A] border border-white/10">
                  <h4 className="font-heading text-sm uppercase tracking-wider text-[#F2B91D] mb-1 font-bold">
                    All-India Express Air Shipping via Shiprocket
                  </h4>
                  <p>Nationwide orders outside Surat are securely bubble-wrapped and shipped via Bluedart / Delhivery Air with live SMS tracking.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Suggested Performance Stacks (5 Products in 1 row on Desktop) */}
        <section className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-[#F2B91D] tracking-widest block">
                COMPATIBLE PERFORMANCE STACKS
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl uppercase font-bold tracking-wide text-white mt-1">
                SUGGESTED PRODUCTS
              </h3>
            </div>
            <Link
              href="/products"
              className="text-xs font-mono uppercase text-[#F2B91D] hover:text-white font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>VIEW ALL SUPPLEMENTS</span>
              <span>→</span>
            </Link>
          </div>

          {/* 5 in 1 row on desktop (lg:grid-cols-5) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {suggestedProducts.map((prod) => {
              const discount = Math.round(
                ((prod.mrpPaise - prod.pricePaise) / prod.mrpPaise) * 100
              );
              const inWishlist = isInWishlist(prod.id);

              return (
                <div
                  key={prod.id}
                  className="bg-[#161313] border border-white/10 hover:border-[#F2B91D] transition-all flex flex-col justify-between group shadow-lg overflow-hidden"
                >
                  {/* Clean Studio White Packshot with Badges & Wishlist Button */}
                  <div className="relative aspect-square bg-white p-3.5 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Left Category / Status Badge */}
                    {prod.badge && (
                      <div className="absolute top-2 left-2 bg-[#7A1F25] text-white font-mono text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider shadow-sm z-10">
                        {prod.badge}
                      </div>
                    )}

                    {/* Right Discount Badge & Add To Wishlist Icon */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                      <span className="bg-black/90 border border-white/20 text-[#F2B91D] font-mono text-[9px] font-bold px-1.5 py-0.5">
                        -{discount}%
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist({
                            id: prod.id,
                            productId: prod.id,
                            name: prod.name,
                            slug: prod.slug,
                            pricePaise: prod.pricePaise,
                            mrpPaise: prod.mrpPaise,
                            image: prod.image,
                            category: prod.category,
                            badge: prod.badge,
                            defaultVariantId: prod.defaultVariantId,
                            defaultSku: prod.defaultSku,
                          });
                        }}
                        className={`p-1.5 border transition-all cursor-pointer ${
                          inWishlist
                            ? 'bg-red-600 border-red-500 text-white shadow-md'
                            : 'bg-black/70 border-white/20 text-white hover:border-red-500 hover:text-red-400'
                        }`}
                        title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        aria-label="Add to Wishlist"
                      >
                        <HeartIcon className="w-3.5 h-3.5" filled={inWishlist} />
                      </button>
                    </div>
                  </div>

                  {/* Card Info & Quick Actions */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2.5">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block mb-1 font-semibold">
                        {prod.category}
                      </span>
                      <Link
                        href={`/products/${prod.slug}`}
                        className="font-sans font-medium text-xs text-white hover:text-[#F2B91D] transition-colors line-clamp-2 leading-snug"
                      >
                        {prod.name}
                      </Link>

                      {/* Stars */}
                      <div className="flex items-center gap-1 pt-1.5">
                        <div className="flex text-[#F2B91D]">
                          {[...Array(5)].map((_, s) => (
                            <StarIcon key={s} className="w-2.5 h-2.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">({prod.rating})</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading text-base sm:text-lg font-bold text-[#F2B91D]">
                          ₹{(prod.pricePaise / 100).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-zinc-400 line-through font-mono">
                          ₹{(prod.mrpPaise / 100).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          addItem({
                            id: prod.defaultVariantId,
                            productId: prod.id,
                            name: prod.name,
                            variantLabel: prod.category,
                            pricePaise: prod.pricePaise,
                            image: prod.image,
                            qty: 1,
                            sku: prod.defaultSku,
                            weightGrams: 1000,
                          });
                          setIsDrawerOpen(true);
                        }}
                        className="w-full py-2 bg-transparent border border-[#F2B91D] text-[#F2B91D] hover:bg-[#F2B91D] hover:text-black font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-[0.98]"
                      >
                        <CartIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>ADD TO CART</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Explore More Supplements Banner */}
        <div className="border border-white/10 bg-gradient-to-r from-[#161313] via-[#7A1F25]/20 to-[#161313] p-8 sm:p-12 text-center space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-[#F2B91D] font-bold">
            LOOKING FOR OTHER STACKS?
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl uppercase font-bold tracking-wide text-white">
            EXPLORE FULL GYMNATION PERFORMANCE LINE
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
            Browse our full catalog of Protein Isolate 10 LB tubs, Micronized Creatine, Pre-workouts, and mass gainers.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-[#F2B91D] text-[#0B0A0A] font-sans font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
            >
              VIEW ALL SUPPLEMENTS &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
