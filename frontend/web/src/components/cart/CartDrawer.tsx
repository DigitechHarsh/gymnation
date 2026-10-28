'use client';

import React from 'react';
import { useCart } from '../../context/CartContext';
import { CloseIcon, CartIcon } from '../common/Icons';

export const CartDrawer: React.FC = () => {
  const {
    items,
    removeItem,
    updateQty,
    subtotalPaise,
    totalCount,
    isDrawerOpen,
    setIsDrawerOpen,
    setIsCheckoutOpen,
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Drawer Container */}
      <div className="relative w-full max-w-md bg-gn-surface border-l border-gn-border h-full flex flex-col justify-between z-10 shadow-2xl">
        {/* Drawer Header */}
        <div className="p-6 border-b border-gn-border flex items-center justify-between bg-gn-black">
          <div className="flex items-center gap-2">
            <CartIcon className="w-5 h-5 text-gn-gold" />
            <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-gn-ivory">
              YOUR CART ({totalCount})
            </h3>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1 text-zinc-400 hover:text-white"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Line Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-12 h-12 bg-gn-black border border-gn-border mx-auto flex items-center justify-center text-zinc-600">
                <CartIcon className="w-6 h-6" />
              </div>
              <div className="font-heading text-lg font-bold uppercase text-zinc-400">
                YOUR CART IS CURRENTLY EMPTY
              </div>
              <p className="text-xs font-mono text-zinc-500 uppercase">
                EXPLORE OUR 100% AUTHENTIC SUPPLEMENTS
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-gn-black border border-gn-border flex gap-4 items-center"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover border border-gn-border shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-bold text-sm uppercase text-gn-ivory truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                    {item.variantLabel}
                  </div>
                  <div className="font-heading font-extrabold text-base text-gn-gold mt-1">
                    ₹{((item.pricePaise * item.qty) / 100).toLocaleString('en-IN')}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-6 h-6 bg-gn-surface border border-gn-border text-gn-ivory hover:border-gn-gold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="font-bold text-gn-ivory">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-6 h-6 bg-gn-surface border border-gn-border text-gn-ivory hover:border-gn-gold flex items-center justify-center"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[10px] text-red-400 hover:underline uppercase ml-auto"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Checkout Button */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gn-border bg-gn-black space-y-4">
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-zinc-400 uppercase">
                <span>SUBTOTAL:</span>
                <span>₹{(subtotalPaise / 100).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-400 uppercase">
                <span>ESTIMATED SHIPPING:</span>
                <span className="text-gn-gold">
                  {subtotalPaise >= 99900 ? 'FREE DELIVERY' : '₹99 (FREE ABOVE ₹999)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full py-4 bg-gn-gold hover:bg-yellow-400 text-gn-black font-heading font-extrabold text-base uppercase tracking-wider transition-colors shadow-lg"
            >
              PROCEED TO CHECKOUT &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
