'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { CartIcon, FilterIcon, SearchIcon, HeartIcon, CloseIcon, CheckIcon } from '../../components/common/Icons';
import { PageHeaderBanner } from '../../components/common/PageHeaderBanner';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  pricePaise: number;
  mrpPaise: number;
  badge?: string;
  category: string;
  form: 'POWDER' | 'GEAR' | 'LIQUID';
  inStock: boolean;
  image: string;
  defaultVariantId: string;
  defaultSku: string;
}

const PRODUCTS: ProductItem[] = [
  {
    id: 'prod_1',
    name: 'GymNation 100% Whey Isolate 10 LB (4.5 KG Mega Tub)',
    slug: 'gold-standard-100-whey-protein',
    pricePaise: 749900,
    mrpPaise: 999900,
    badge: '10 LB MEGA TUB',
    category: 'PROTEIN',
    form: 'POWDER',
    inStock: true,
    image: '/protein_tub.jpg',
    defaultVariantId: 'var_whey_10lb',
    defaultSku: 'GN-WHEY-ISO-10LB',
  },
  {
    id: 'prod_2',
    name: 'GymNation 100% Pure Micronized Creatine 500g (200 Mesh)',
    slug: 'micronized-creatine-monohydrate',
    pricePaise: 129900,
    mrpPaise: 179900,
    badge: '500G PRO TUB',
    category: 'CREATINE',
    form: 'POWDER',
    inStock: true,
    image: '/creatine_tub.jpg',
    defaultVariantId: 'var_creatine_500g',
    defaultSku: 'GN-CREATINE-500G',
  },
  {
    id: 'prod_3',
    name: 'GymNation 100% Whey Isolate 1 KG (Double Rich Chocolate)',
    slug: 'gold-standard-100-whey-protein',
    pricePaise: 349900,
    mrpPaise: 449900,
    badge: 'BESTSELLER',
    category: 'PROTEIN',
    form: 'POWDER',
    inStock: true,
    image: '/protein_tub.jpg',
    defaultVariantId: 'var_whey_1kg',
    defaultSku: 'GN-WHEY-ISO-1KG',
  },
  {
    id: 'prod_4',
    name: 'GymNation Micronized Creatine 250g (Compact Tub)',
    slug: 'micronized-creatine-monohydrate',
    pricePaise: 79900,
    mrpPaise: 119900,
    badge: '200 MESH',
    category: 'CREATINE',
    form: 'POWDER',
    inStock: true,
    image: '/creatine_tub.jpg',
    defaultVariantId: 'var_creatine_250g',
    defaultSku: 'GN-CREATINE-250G',
  },
  {
    id: 'prod_5',
    name: 'Pre-Workout Explosive Nitro 300g (Watermelon Blast)',
    slug: 'gold-standard-100-whey-protein',
    pricePaise: 159900,
    mrpPaise: 219900,
    badge: 'NEW FORMULA',
    category: 'PRE-WORKOUT',
    form: 'POWDER',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&auto=format&fit=crop&q=80',
    defaultVariantId: 'var_pre_1',
    defaultSku: 'GN-PRE-NITRO-300G',
  },
  {
    id: 'prod_6',
    name: 'Anabolic Mass Gainer 5 KG (Chocolate Fudge)',
    slug: 'gold-standard-100-whey-protein',
    pricePaise: 389900,
    mrpPaise: 499900,
    badge: 'HEAVY BULK',
    category: 'MASS GAINER',
    form: 'POWDER',
    inStock: true,
    image: '/protein_tub.jpg',
    defaultVariantId: 'var_mass_5kg',
    defaultSku: 'GN-MASS-5KG',
  },
  {
    id: 'prod_7',
    name: 'GymNation Heavy-Duty Stainless Steel Shaker Bottle 750ml',
    slug: 'gold-standard-100-whey-protein',
    pricePaise: 59900,
    mrpPaise: 89900,
    badge: 'GEAR',
    category: 'ACCESSORIES',
    form: 'GEAR',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    defaultVariantId: 'var_shaker_1',
    defaultSku: 'GN-SHAKER-STEEL',
  },
  {
    id: 'prod_8',
    name: 'GymNation BCAA 2:1:1 Intra-Workout 400g (Green Apple)',
    slug: 'gold-standard-100-whey-protein',
    pricePaise: 169900,
    mrpPaise: 239900,
    badge: 'INTRA-WORKOUT',
    category: 'AMINO ACIDS',
    form: 'POWDER',
    inStock: true,
    image: '/protein_tub.jpg',
    defaultVariantId: 'var_bcaa_400g',
    defaultSku: 'GN-BCAA-400G',
  },
  {
    id: 'prod_9',
    name: 'GymNation Raw 100% Whey Concentrate 80% 1 KG (Unflavored)',
    slug: 'gold-standard-100-whey-protein',
    pricePaise: 219900,
    mrpPaise: 299900,
    badge: 'RAW UNFLAVORED',
    category: 'PROTEIN',
    form: 'POWDER',
    inStock: false,
    image: '/protein_tub.jpg',
    defaultVariantId: 'var_whey_raw',
    defaultSku: 'GN-WHEY-RAW-1KG',
  },
];

const CATEGORIES = [
  'ALL',
  'PROTEIN',
  'CREATINE',
  'PRE-WORKOUT',
  'MASS GAINER',
  'AMINO ACIDS',
  'ACCESSORIES',
] as const;

const PRICE_RANGES = [
  { id: 'ALL', label: 'All Prices' },
  { id: 'UNDER_1000', label: 'Under ₹1,000' },
  { id: '1000_2500', label: '₹1,000 – ₹2,500' },
  { id: '2500_5000', label: '₹2,500 – ₹5,000' },
  { id: 'ABOVE_5000', label: 'Above ₹5,000' },
] as const;

const SUPPLEMENT_FORMS = [
  { id: 'ALL', label: 'All Forms' },
  { id: 'POWDER', label: 'Nutrition Powders' },
  { id: 'GEAR', label: 'Gym Gear & Shakers' },
] as const;

export default function ProductsPage() {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Filter state
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('ALL');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedForm, setSelectedForm] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('FEATURED');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCat !== 'ALL') count++;
    if (selectedPriceRange !== 'ALL') count++;
    if (inStockOnly) count++;
    if (selectedForm !== 'ALL') count++;
    if (search.trim() !== '') count++;
    return count;
  }, [selectedCat, selectedPriceRange, inStockOnly, selectedForm, search]);

  const resetAllFilters = () => {
    setSelectedCat('ALL');
    setSelectedPriceRange('ALL');
    setInStockOnly(false);
    setSelectedForm('ALL');
    setSearch('');
  };

  // Category counts based on overall products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: PRODUCTS.length };
    PRODUCTS.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered & sorted products
  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Category filter
      if (selectedCat !== 'ALL' && p.category !== selectedCat) return false;

      // Price filter
      const priceRupees = p.pricePaise / 100;
      if (selectedPriceRange === 'UNDER_1000' && priceRupees >= 1000) return false;
      if (selectedPriceRange === '1000_2500' && (priceRupees < 1000 || priceRupees > 2500)) return false;
      if (selectedPriceRange === '2500_5000' && (priceRupees < 2500 || priceRupees > 5000)) return false;
      if (selectedPriceRange === 'ABOVE_5000' && priceRupees <= 5000) return false;

      // In stock filter
      if (inStockOnly && !p.inStock) return false;

      // Form filter
      if (selectedForm !== 'ALL' && p.form !== selectedForm) return false;

      // Search keyword filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCat = p.category.toLowerCase().includes(query);
        const matchesBadge = p.badge?.toLowerCase().includes(query);
        if (!matchesName && !matchesCat && !matchesBadge) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'PRICE_LOW') return a.pricePaise - b.pricePaise;
      if (sortBy === 'PRICE_HIGH') return b.pricePaise - a.pricePaise;
      if (sortBy === 'DISCOUNT') {
        const discA = (a.mrpPaise - a.pricePaise) / a.mrpPaise;
        const discB = (b.mrpPaise - b.pricePaise) / b.mrpPaise;
        return discB - discA;
      }
      return 0;
    });
  }, [selectedCat, selectedPriceRange, inStockOnly, selectedForm, search, sortBy]);

  // Filter sidebar contents (reusable for both desktop sidebar and mobile offcanvas drawer)
  const FilterControls = () => (
    <div className="space-y-6 text-xs font-mono">
      {/* Category Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-gn-border/70">
          <span className="font-heading font-bold text-sm uppercase tracking-wider text-gn-ivory">
            CATEGORY
          </span>
          {selectedCat !== 'ALL' && (
            <button
              onClick={() => setSelectedCat('ALL')}
              className="text-[10px] text-gn-gold hover:underline uppercase"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`w-full flex items-center justify-between py-1.5 px-2 text-left transition-colors ${
                  isSelected
                    ? 'bg-gn-maroon text-white font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-white bg-white text-gn-maroon' : 'border-zinc-600 bg-gn-black'
                    }`}
                  >
                    {isSelected && <CheckIcon className="w-2.5 h-2.5 text-gn-maroon" />}
                  </div>
                  <span className="uppercase tracking-wide">{cat}</span>
                </div>
                <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-zinc-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="space-y-2.5 pt-4 border-t border-gn-border/70">
        <div className="flex items-center justify-between pb-1 border-b border-gn-border/70">
          <span className="font-heading font-bold text-sm uppercase tracking-wider text-gn-ivory">
            PRICE RANGE
          </span>
          {selectedPriceRange !== 'ALL' && (
            <button
              onClick={() => setSelectedPriceRange('ALL')}
              className="text-[10px] text-gn-gold hover:underline uppercase"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-1">
          {PRICE_RANGES.map((pr) => {
            const isSelected = selectedPriceRange === pr.id;
            return (
              <button
                key={pr.id}
                onClick={() => setSelectedPriceRange(pr.id)}
                className={`w-full flex items-center justify-between py-1.5 px-2 text-left transition-colors ${
                  isSelected
                    ? 'bg-gn-gold/15 text-gn-gold font-bold border-l-2 border-gn-gold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-gn-gold bg-gn-gold' : 'border-zinc-600 bg-gn-black'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-gn-black" />}
                  </div>
                  <span className="tracking-wide">{pr.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability / In Stock Section */}
      <div className="space-y-2.5 pt-4 border-t border-gn-border/70">
        <div className="pb-1 border-b border-gn-border/70">
          <span className="font-heading font-bold text-sm uppercase tracking-wider text-gn-ivory">
            AVAILABILITY
          </span>
        </div>
        <label className="flex items-center gap-2.5 py-2 px-2.5 bg-gn-black border border-gn-border cursor-pointer hover:border-gn-gold/50 transition-colors">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="accent-[#F2B91D] w-4 h-4 cursor-pointer"
          />
          <span className="uppercase text-zinc-300 font-medium">In Stock Only</span>
        </label>
      </div>

      {/* Supplement Form Section */}
      <div className="space-y-2.5 pt-4 border-t border-gn-border/70">
        <div className="flex items-center justify-between pb-1 border-b border-gn-border/70">
          <span className="font-heading font-bold text-sm uppercase tracking-wider text-gn-ivory">
            SUPPLEMENT FORM
          </span>
          {selectedForm !== 'ALL' && (
            <button
              onClick={() => setSelectedForm('ALL')}
              className="text-[10px] text-gn-gold hover:underline uppercase"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-1">
          {SUPPLEMENT_FORMS.map((form) => {
            const isSelected = selectedForm === form.id;
            return (
              <button
                key={form.id}
                onClick={() => setSelectedForm(form.id)}
                className={`w-full flex items-center justify-between py-1.5 px-2 text-left transition-colors ${
                  isSelected
                    ? 'bg-gn-surface text-white font-bold border border-gn-gold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="tracking-wide uppercase">{form.label}</span>
                {isSelected && <CheckIcon className="w-3.5 h-3.5 text-gn-gold" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gn-black text-gn-ivory">
      {/* Cinematic Subpage Header Banner */}
      <PageHeaderBanner
        title="OUR PERFORMANCE"
        accentWord="Supplements"
        eyebrow="AUTHORIZED LAB-TESTED NUTRITION • BHATAR, SURAT"
        subtitle="100% Genuine 10 LB Whey Isolate Mega Tubs, 200 Mesh Micronized Creatine, and high-potency sports nutrition with direct Surat store pickup and same-day delivery."
        bgImage="/why_us_header.jpg"
        breadcrumbLabel="Products"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10">

        {/* Top Filter Bar (Search, Mobile Drawer Trigger, Sort & Active Chips) */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gn-surface border border-gn-border p-3 sm:p-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH SUPPLEMENTS, CREATINE, PROTEIN..."
                className="w-full bg-gn-black border border-gn-border pl-9 pr-8 py-2.5 text-xs text-gn-ivory placeholder-zinc-600 focus:outline-none focus:border-gn-gold uppercase font-mono tracking-wide"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  aria-label="Clear search"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filter Trigger Button (< lg) */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gn-black hover:bg-gn-surface border border-gn-border hover:border-gn-gold text-gn-ivory text-xs font-mono uppercase tracking-wider transition-colors"
                aria-label="Open filter menu"
              >
                <FilterIcon className="w-4 h-4 text-gn-gold" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-gn-gold text-gn-black font-bold text-[10px] flex items-center justify-center ml-0.5">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Sort Selector */}
              <div className="flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-gn-black border border-gn-border px-3 py-2.5 text-xs text-gn-ivory font-mono uppercase focus:outline-none focus:border-gn-gold cursor-pointer"
                >
                  <option value="FEATURED">SORT: FEATURED</option>
                  <option value="PRICE_LOW">PRICE: LOW TO HIGH</option>
                  <option value="PRICE_HIGH">PRICE: HIGH TO LOW</option>
                  <option value="DISCOUNT">BIGGEST DISCOUNT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Pills Bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Active Filters:</span>

              {selectedCat !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gn-surface border border-gn-border text-white uppercase">
                  Category: <strong className="text-gn-gold">{selectedCat}</strong>
                  <button onClick={() => setSelectedCat('ALL')} className="hover:text-red-400">
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedPriceRange !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gn-surface border border-gn-border text-white uppercase">
                  Price: <strong className="text-gn-gold">{PRICE_RANGES.find((p) => p.id === selectedPriceRange)?.label}</strong>
                  <button onClick={() => setSelectedPriceRange('ALL')} className="hover:text-red-400">
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gn-surface border border-gn-border text-white uppercase">
                  Status: <strong className="text-emerald-400">In Stock Only</strong>
                  <button onClick={() => setInStockOnly(false)} className="hover:text-red-400">
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedForm !== 'ALL' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gn-surface border border-gn-border text-white uppercase">
                  Form: <strong className="text-gn-gold">{selectedForm}</strong>
                  <button onClick={() => setSelectedForm('ALL')} className="hover:text-red-400">
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              {search.trim() && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gn-surface border border-gn-border text-white uppercase">
                  Search: <strong className="text-gn-gold">&quot;{search}&quot;</strong>
                  <button onClick={() => setSearch('')} className="hover:text-red-400">
                    <CloseIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={resetAllFilters}
                className="text-gn-gold hover:underline uppercase text-[10px] ml-1"
              >
                Reset All ({activeFiltersCount})
              </button>
            </div>
          )}
        </div>

        {/* Main Content Layout: Left Sidebar + Right Products Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Desktop Left Filtering Pane (Visible only on lg+) */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-24 bg-gn-surface border border-gn-border p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gn-border">
              <div className="flex items-center gap-2">
                <FilterIcon className="w-4 h-4 text-gn-gold" />
                <h3 className="font-heading font-bold text-base uppercase tracking-wider text-gn-ivory">
                  FILTER CATALOG
                </h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-[10px] font-mono text-zinc-400 hover:text-gn-gold uppercase underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <FilterControls />
          </aside>

          {/* Right Column: Products Catalog */}
          <main className="flex-1 w-full space-y-6">
            {/* Header info bar */}
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-gn-border/50">
              <div>
                SHOWING <strong className="text-white">{filtered.length}</strong> OF{' '}
                <strong className="text-white">{PRODUCTS.length}</strong> SUPPLEMENTS
              </div>
              <div className="hidden sm:block text-[11px] text-zinc-500 uppercase">
                100% Genuine Importer Hologram Guaranteed
              </div>
            </div>

            {/* Empty State */}
            {filtered.length === 0 ? (
              <div className="p-12 text-center bg-gn-surface border border-gn-border space-y-4">
                <FilterIcon className="w-10 h-10 text-zinc-600 mx-auto" />
                <h4 className="font-heading text-xl font-bold uppercase text-white">
                  No Supplements Found
                </h4>
                <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto">
                  We couldn&apos;t find any supplements matching your selected category, price, or stock filters.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="px-6 py-2.5 bg-gn-gold hover:bg-yellow-400 text-gn-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
                >
                  RESET ALL FILTERS
                </button>
              </div>
            ) : (
              /* Products Grid (1 col on mobile, 2 on tablet, 3 on desktop with sidebar) */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((prod) => {
                  const discountPercent = Math.round(
                    ((prod.mrpPaise - prod.pricePaise) / prod.mrpPaise) * 100
                  );

                  return (
                    <div
                      key={prod.id}
                      className="bg-gn-surface border border-gn-border group hover:border-gn-gold transition-colors flex flex-col justify-between"
                    >
                      {/* Packshot Image with White Studio Backdrop */}
                      <div className="relative aspect-square overflow-hidden bg-white p-4 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                          {prod.badge && (
                            <div className="bg-gn-maroon text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                              {prod.badge}
                            </div>
                          )}
                          {!prod.inStock && (
                            <div className="bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                              OUT OF STOCK
                            </div>
                          )}
                        </div>

                        {/* Discount & Wishlist Buttons */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <div className="bg-gn-black border border-gn-border text-gn-gold font-mono text-[10px] font-bold px-2 py-0.5">
                            -{discountPercent}%
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
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
                            className={`p-1.5 border transition-all ${
                              isInWishlist(prod.id)
                                ? 'bg-red-600 border-red-500 text-white shadow-md'
                                : 'bg-black/75 hover:bg-black border-white/20 text-white hover:text-red-400'
                            }`}
                            title={isInWishlist(prod.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            aria-label="Wishlist"
                          >
                            <HeartIcon className="w-3.5 h-3.5" filled={isInWishlist(prod.id)} />
                          </button>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400 font-medium tracking-wider">
                            <span>{prod.category}</span>
                            <span>{prod.form}</span>
                          </div>
                          <Link
                            href={`/products/${prod.slug}`}
                            className="font-heading font-bold text-lg text-gn-ivory hover:text-gn-gold transition-colors uppercase tracking-wide line-clamp-2 block mt-1"
                          >
                            {prod.name}
                          </Link>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-gn-border/50">
                          <div className="flex items-baseline gap-2">
                            <span className="font-heading font-bold text-2xl text-gn-gold">
                              ₹{(prod.pricePaise / 100).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs font-mono font-medium text-zinc-400 line-through">
                              ₹{(prod.mrpPaise / 100).toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              href={`/products/${prod.slug}`}
                              className="py-2.5 bg-gn-black hover:bg-gn-surface border border-gn-border hover:border-gn-gold text-gn-ivory font-sans font-semibold text-xs uppercase tracking-wider text-center transition-colors"
                            >
                              DETAILS
                            </Link>
                            <button
                              disabled={!prod.inStock}
                              onClick={() =>
                                addItem({
                                  id: prod.defaultVariantId,
                                  productId: prod.id,
                                  name: prod.name,
                                  variantLabel: 'Standard Tub',
                                  pricePaise: prod.pricePaise,
                                  image: prod.image,
                                  qty: 1,
                                  sku: prod.defaultSku,
                                })
                              }
                              className={`py-2.5 font-sans font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-md ${
                                prod.inStock
                                  ? 'bg-gn-maroon hover:bg-gn-maroon/80 text-white'
                                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                              }`}
                            >
                              <CartIcon className="w-3.5 h-3.5" />
                              <span>{prod.inStock ? '+ ADD' : 'SOLDOUT'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Off-Canvas Filter Drawer (< lg) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-gn-surface border-r border-gn-border shadow-2xl flex flex-col z-10 animate-slideRight">
            
            {/* Drawer Header */}
            <div className="p-4 bg-gn-black border-b border-gn-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FilterIcon className="w-4 h-4 text-gn-gold" />
                <h3 className="font-heading font-bold text-base uppercase tracking-wider text-gn-ivory">
                  FILTER SUPPLEMENTS
                </h3>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close filters"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filter Options */}
            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              <FilterControls />
            </div>

            {/* Fixed Drawer Footer */}
            <div className="p-4 bg-gn-black border-t border-gn-border space-y-2">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-3 bg-gn-gold hover:bg-yellow-400 text-gn-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
              >
                SHOW {filtered.length} RESULTS
              </button>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="w-full py-2 text-center text-xs font-mono text-zinc-400 hover:text-white uppercase"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
