'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { CloseIcon, CartIcon, HeartIcon } from '../common/Icons';

export const WishlistDrawer: React.FC = () => {
  const { items, isWishlistOpen, setIsWishlistOpen, removeFromWishlist } = useWishlist();
  const { addItem, setIsDrawerOpen } = useCart();

  if (!isWishlistOpen) return null;

  const handleMoveToCart = (item: any) => {
    addItem({
      id: `cart_${item.productId}`,
      productId: item.productId,
      name: item.name,
      variantLabel: 'Standard Tub',
      pricePaise: item.pricePaise,
      image: item.image,
      qty: 1,
      sku: `SKU-${item.productId.slice(0, 6).toUpperCase()}`,
    });
    removeFromWishlist(item.productId);
    setIsWishlistOpen(false);
    setIsDrawerOpen(true);
  };

  return (
    <div
      onClick={() => setIsWishlistOpen(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#161313] border-l border-white/10 h-full flex flex-col justify-between shadow-2xl animate-fadeIn"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HeartIcon className="w-5 h-5 text-[#F2B91D] fill-[#F2B91D]" filled />
            <div>
              <h2 className="font-heading text-xl uppercase font-bold tracking-wide text-white">
                SAVED WISHLIST ({items.length})
              </h2>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                Saved for quick checkout
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close Wishlist"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#F2B91D]">
                <HeartIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="font-heading text-lg font-bold uppercase text-white">
                  YOUR WISHLIST IS EMPTY
                </div>
                <p className="text-xs text-zinc-400 font-sans max-w-xs">
                  Save your favorite 10 LB Whey Protein tubs and Micronized Creatine for quick re-orders.
                </p>
              </div>
              <Link
                href="/products"
                onClick={() => setIsWishlistOpen(false)}
                className="px-6 py-2.5 bg-[#F2B91D] text-[#0B0A0A] font-sans font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
              >
                BROWSE SUPPLEMENTS
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="p-4 bg-[#0B0A0A] border border-white/10 flex gap-4 items-center justify-between group hover:border-[#F2B91D]/50 transition-colors"
              >
                {/* Product Packshot on Solid White Background */}
                <div className="w-20 h-20 bg-white p-2 rounded-sm border border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">
                    {item.category || 'SUPPLEMENT'}
                  </div>
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={() => setIsWishlistOpen(false)}
                    className="font-heading font-semibold text-xs uppercase text-white hover:text-[#F2B91D] line-clamp-1 block"
                  >
                    {item.name}
                  </Link>
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading font-bold text-base text-[#F2B91D]">
                      ₹{(item.pricePaise / 100).toLocaleString('en-IN')}
                    </span>
                    {item.mrpPaise > item.pricePaise && (
                      <span className="text-[10px] font-mono text-zinc-500 line-through">
                        ₹{(item.mrpPaise / 100).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="px-3 py-1 bg-[#7A1F25] hover:bg-[#7A1F25]/80 text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <CartIcon className="w-3 h-3" />
                      <span>+ MOVE TO CART</span>
                    </button>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromWishlist(item.productId)}
                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors shrink-0"
                  aria-label="Remove from wishlist"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-[#0B0A0A] space-y-3">
            <Link
              href="/products"
              onClick={() => setIsWishlistOpen(false)}
              className="block w-full py-3 bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-xs uppercase tracking-widest text-center transition-colors border border-white/10"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
