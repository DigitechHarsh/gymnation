'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { CartIcon, HeartIcon } from '../common/Icons';
import { apiClient } from '../../lib/api';
import { ScrollReveal } from '../common/ScrollReveal';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  pricePaise: number;
  mrpPaise: number;
  badge?: string;
  category: string;
  image: string;
  defaultVariantId: string;
  defaultSku: string;
}

const FEATURED_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_1',
    name: 'GymNation 100% Whey Isolate 10 LB (4.5 KG Mega Tub)',
    slug: 'gold-standard-100-whey-protein',
    pricePaise: 749900,
    mrpPaise: 999900,
    badge: '10 LB MEGA TUB',
    category: 'WHEY PROTEIN',
    image: '/protein_tub.jpg',
    defaultVariantId: 'var_whey_10lb',
    defaultSku: 'GN-WHEY-10LB',
  },
  {
    id: 'prod_2',
    name: 'GymNation Micronized Creatine Monohydrate 500g',
    slug: 'micronized-creatine-monohydrate',
    pricePaise: 129900,
    mrpPaise: 179900,
    badge: '500G PRO TUB',
    category: 'CREATINE',
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
    category: 'WHEY PROTEIN',
    image: '/protein_tub.jpg',
    defaultVariantId: 'var_whey_1kg',
    defaultSku: 'GN-WHEY-1KG',
  },
  {
    id: 'prod_4',
    name: 'GymNation 200 Mesh Micronized Creatine 250g',
    slug: 'micronized-creatine-monohydrate',
    pricePaise: 79900,
    mrpPaise: 119900,
    badge: '200 MESH PURE',
    category: 'CREATINE',
    image: '/creatine_tub.jpg',
    defaultVariantId: 'var_creatine_250g',
    defaultSku: 'GN-CREATINE-250G',
  },
];

export const ProductsSection: React.FC = () => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState<ProductItem[]>(FEATURED_PRODUCTS);

  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const res = await apiClient.get('/products?limit=8');
        if (res.data?.data && res.data.data.length > 0) {
          const liveList: ProductItem[] = res.data.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            pricePaise: p.price,
            mrpPaise: p.mrp || Math.round(p.price * 1.3),
            badge: p.badge || (p.name.includes('10 LB') ? '10 LB MEGA TUB' : 'AUTHENTIC'),
            category: p.category?.name?.toUpperCase() || 'SUPPLEMENT',
            image:
              p.images?.[0]?.url ||
              (p.name.toLowerCase().includes('creatine')
                ? '/creatine_tub.jpg'
                : '/protein_tub.jpg'),
            defaultVariantId: p.variants?.[0]?.id || `var_${p.id}`,
            defaultSku: p.sku || 'GN-SKU',
          }));
          setProducts(liveList);
        }
      } catch {
        // Fallback to local storage or featured
        try {
          const cached = localStorage.getItem('gn_products_list');
          if (cached) {
            setProducts(JSON.parse(cached));
          }
        } catch {
          // keep featured
        }
      }
    };
    fetchLiveProducts();
  }, []);

  const handleQuickAdd = (p: ProductItem) => {
    addItem({
      id: p.defaultVariantId,
      productId: p.id,
      name: p.name,
      variantLabel: 'Standard Tub',
      pricePaise: p.pricePaise,
      image: p.image,
      qty: 1,
      sku: p.defaultSku,
    });
  };

  const handleWishlistClick = (p: ProductItem) => {
    toggleWishlist({
      id: p.id,
      productId: p.id,
      name: p.name,
      slug: p.slug,
      pricePaise: p.pricePaise,
      mrpPaise: p.mrpPaise,
      image: p.image,
      category: p.category,
      badge: p.badge,
      defaultVariantId: p.defaultVariantId,
      defaultSku: p.defaultSku,
    });
  };

  return (
    <section className="py-20 px-6 lg:px-16 bg-gn-black border-b border-gn-border">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Title with link to catalog */}
        <ScrollReveal effect="fade-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-gn-border pb-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-gn-gold font-bold">
                AUTHORIZED LAB-TESTED PERFORMANCE NUTRITION
              </div>
              <h2 className="font-heading text-4xl sm:text-6xl font-bold uppercase tracking-wide text-gn-ivory mt-1">
                FUEL YOUR <span className="font-accent text-5xl sm:text-7xl text-gn-gold lowercase select-none">Performance</span>
              </h2>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gn-gold hover:text-white transition-colors border-b border-gn-gold/50 pb-1 font-semibold"
            >
              <span>VIEW ALL SUPPLEMENTS</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </ScrollReveal>

        {/* Product Cards Grid with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod, idx) => {
            const discountPercent = Math.round(
              ((prod.mrpPaise - prod.pricePaise) / prod.mrpPaise) * 100
            );

            return (
              <ScrollReveal effect="fade-up" delay={idx * 120} key={prod.id}>
                <div
                  className="bg-gn-surface border border-gn-border group hover:border-gn-gold transition-colors flex flex-col justify-between h-full"
                >
                  {/* Image on Clean White Studio Background */}
                  <div className="relative aspect-square overflow-hidden bg-white p-4 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    {prod.badge && (
                      <div className="absolute top-3 left-3 bg-gn-maroon text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                        {prod.badge}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <div className="bg-gn-black border border-gn-border text-gn-gold font-mono text-[10px] font-bold px-2 py-0.5">
                        -{discountPercent}%
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleWishlistClick(prod);
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

                  {/* Details */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-zinc-400 font-medium tracking-wider">
                        {prod.category}
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
                          onClick={() => handleQuickAdd(prod)}
                          className="py-2.5 bg-gn-maroon hover:bg-gn-maroon/80 text-white font-sans font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-md"
                        >
                          <CartIcon className="w-3.5 h-3.5" />
                          <span>+ ADD</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
