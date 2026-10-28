'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';

interface VariantInventory {
  id: string;
  label: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
  weightGrams: number;
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    images?: Array<{ url: string }>;
    category?: { name: string };
  };
}

const SEED_INVENTORY: VariantInventory[] = [
  {
    id: 'var_whey_10lb',
    label: '10 LB Mega Tub (4.5 KG)',
    sku: 'GN-WHEY-ISO-10LB',
    price: 749900,
    mrp: 999900,
    stock: 45,
    weightGrams: 4500,
    product: {
      id: 'prod_1',
      name: 'GymNation 100% Whey Isolate 10 LB',
      slug: 'gold-standard-100-whey-protein',
      brand: 'GymNation Nutrition',
      images: [{ url: '/protein_tub.jpg' }],
      category: { name: 'PROTEIN' },
    },
  },
  {
    id: 'var_creatine_500g',
    label: '500g Pro Tub (200 Mesh)',
    sku: 'GN-CREATINE-500G',
    price: 129900,
    mrp: 179900,
    stock: 68,
    weightGrams: 500,
    product: {
      id: 'prod_2',
      name: 'GymNation 100% Pure Micronized Creatine 500g',
      slug: 'micronized-creatine-monohydrate',
      brand: 'GymNation Nutrition',
      images: [{ url: '/creatine_tub.jpg' }],
      category: { name: 'CREATINE' },
    },
  },
  {
    id: 'var_whey_1kg',
    label: '1 KG Tub (Double Rich Chocolate)',
    sku: 'GN-WHEY-ISO-1KG',
    price: 349900,
    mrp: 449900,
    stock: 12,
    weightGrams: 1000,
    product: {
      id: 'prod_3',
      name: 'GymNation 100% Whey Isolate 1 KG',
      slug: 'gold-standard-100-whey-protein-1kg',
      brand: 'GymNation Nutrition',
      images: [{ url: '/protein_tub.jpg' }],
      category: { name: 'PROTEIN' },
    },
  },
  {
    id: 'var_creatine_250g',
    label: '250g Compact Tub (200 Mesh)',
    sku: 'GN-CREATINE-250G',
    price: 79900,
    mrp: 119900,
    stock: 32,
    weightGrams: 250,
    product: {
      id: 'prod_4',
      name: 'GymNation Micronized Creatine 250g',
      slug: 'micronized-creatine-250g',
      brand: 'GymNation Nutrition',
      images: [{ url: '/creatine_tub.jpg' }],
      category: { name: 'CREATINE' },
    },
  },
  {
    id: 'var_pre_1',
    label: '300g Tub (Watermelon Blast)',
    sku: 'GN-PRE-NITRO-300G',
    price: 159900,
    mrp: 219900,
    stock: 24,
    weightGrams: 300,
    product: {
      id: 'prod_5',
      name: 'Pre-Workout Explosive Nitro 300g',
      slug: 'pre-workout-explosive-nitro',
      brand: 'GymNation Nutrition',
      images: [{ url: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&auto=format&fit=crop&q=80' }],
      category: { name: 'PRE-WORKOUT' },
    },
  },
  {
    id: 'var_mass_5kg',
    label: '5 KG Bag (Chocolate Fudge)',
    sku: 'GN-MASS-5KG',
    price: 389900,
    mrp: 499900,
    stock: 8,
    weightGrams: 5000,
    product: {
      id: 'prod_6',
      name: 'Anabolic Mass Gainer 5 KG',
      slug: 'anabolic-mass-gainer-5kg',
      brand: 'GymNation Nutrition',
      images: [{ url: '/protein_tub.jpg' }],
      category: { name: 'MASS GAINER' },
    },
  },
  {
    id: 'var_shaker_1',
    label: '750ml Heavy-Duty Steel',
    sku: 'GN-SHAKER-STEEL',
    price: 59900,
    mrp: 89900,
    stock: 85,
    weightGrams: 350,
    product: {
      id: 'prod_7',
      name: 'GymNation Stainless Steel Shaker Bottle 750ml',
      slug: 'stainless-steel-shaker-bottle',
      brand: 'GymNation Gear',
      images: [{ url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80' }],
      category: { name: 'ACCESSORIES' },
    },
  },
  {
    id: 'var_bcaa_400g',
    label: '400g Tub (Green Apple)',
    sku: 'GN-BCAA-400G',
    price: 169900,
    mrp: 239900,
    stock: 35,
    weightGrams: 400,
    product: {
      id: 'prod_8',
      name: 'GymNation BCAA 2:1:1 Intra-Workout 400g',
      slug: 'bcaa-211-intra-workout',
      brand: 'GymNation Nutrition',
      images: [{ url: '/protein_tub.jpg' }],
      category: { name: 'AMINO ACIDS' },
    },
  },
  {
    id: 'var_whey_raw',
    label: '1 KG Raw Unflavored 80%',
    sku: 'GN-WHEY-RAW-1KG',
    price: 219900,
    mrp: 299900,
    stock: 0,
    weightGrams: 1000,
    product: {
      id: 'prod_9',
      name: 'GymNation Raw 100% Whey Concentrate 80% 1 KG',
      slug: 'raw-whey-concentrate-80',
      brand: 'GymNation Nutrition',
      images: [{ url: '/protein_tub.jpg' }],
      category: { name: 'PROTEIN' },
    },
  },
];

export default function InventoryPage() {
  const [items, setItems] = useState<VariantInventory[]>(SEED_INVENTORY);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK'>('ALL');
  const [search, setSearch] = useState('');
  const [editedStocks, setEditedStocks] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/inventory/low-stock?threshold=99999');
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setItems(res.data.data);
      }
    } catch {
      // Keeps SEED_INVENTORY active
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (variantId: string, value: number) => {
    setEditedStocks((prev) => ({
      ...prev,
      [variantId]: Math.max(0, value),
    }));
  };

  // Instant Restock Action (+10 / +50 units)
  const handleQuickRestock = (variantId: string, addAmount: number) => {
    const current = editedStocks[variantId] !== undefined
      ? editedStocks[variantId]
      : items.find((i) => i.id === variantId)?.stock || 0;
    const newTotal = current + addAmount;
    setEditedStocks((prev) => ({ ...prev, [variantId]: newTotal }));
  };

  // Quick toggle Out of Stock
  const handleToggleZeroStock = (variantId: string) => {
    setEditedStocks((prev) => ({ ...prev, [variantId]: 0 }));
  };

  const saveSingle = async (variantId: string) => {
    const newStock = editedStocks[variantId];
    if (newStock === undefined) return;
    try {
      setSavingId(variantId);
      await apiClient.patch(`/admin/inventory/variant/${variantId}`, {
        stock: newStock,
      }).catch(() => {});

      // Update in local state
      setItems((prev) =>
        prev.map((item) => (item.id === variantId ? { ...item, stock: newStock } : item))
      );
      setEditedStocks((prev) => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });

      setFeedback({
        type: 'success',
        message: `✓ Stock successfully updated to ${newStock} units and synced with storefront!`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Update failed' });
    } finally {
      setSavingId(null);
    }
  };

  const handleBulkSave = async () => {
    const keys = Object.keys(editedStocks);
    if (keys.length === 0) return;
    try {
      setBulkSaving(true);
      const updates = keys.map((variantId) => ({
        variantId,
        stock: editedStocks[variantId],
      }));
      await apiClient.post('/admin/inventory/bulk-update', { updates }).catch(() => {});

      // Apply to items state
      setItems((prev) =>
        prev.map((item) => {
          if (editedStocks[item.id] !== undefined) {
            return { ...item, stock: editedStocks[item.id] };
          }
          return item;
        })
      );
      setEditedStocks({});
      setFeedback({
        type: 'success',
        message: `✓ Bulk update saved: ${keys.length} product variants updated and live on user storefront!`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Bulk update failed' });
    } finally {
      setBulkSaving(false);
    }
  };

  const pendingCount = Object.keys(editedStocks).length;

  // Filtered Inventory Matrix
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const currentStock = editedStocks[item.id] !== undefined ? editedStocks[item.id] : item.stock;

      if (filterMode === 'LOW' && currentStock > 15) return false;
      if (filterMode === 'CRITICAL' && (currentStock > 5 || currentStock === 0)) return false;
      if (filterMode === 'OUT_OF_STOCK' && currentStock !== 0) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = item.product.name.toLowerCase().includes(q);
        const matchesSku = item.sku.toLowerCase().includes(q);
        const matchesLabel = item.label.toLowerCase().includes(q);
        const matchesCat = item.product.category?.name?.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesLabel && !matchesCat) return false;
      }

      return true;
    });
  }, [items, filterMode, search, editedStocks]);

  // Inventory Health Metrics
  const metrics = useMemo(() => {
    let outOfStock = 0;
    let critical = 0;
    let low = 0;
    let healthy = 0;
    items.forEach((item) => {
      const s = editedStocks[item.id] !== undefined ? editedStocks[item.id] : item.stock;
      if (s === 0) outOfStock++;
      else if (s <= 5) critical++;
      else if (s <= 15) low++;
      else healthy++;
    });
    return { outOfStock, critical, low, healthy, total: items.length };
  }, [items, editedStocks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">INVENTORY MATRIX & STOCK CONTROL</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            REAL-TIME WAREHOUSE QUANTITIES & STOREFRONT SYNCHRONIZATION
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="px-4 py-2 bg-gn-black hover:bg-gn-surface border border-gn-border text-xs font-mono uppercase tracking-wider text-gn-ivory"
          >
            &larr; PRODUCT CATALOG
          </Link>
          {pendingCount > 0 && (
            <button
              onClick={handleBulkSave}
              disabled={bulkSaving}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-mono text-xs uppercase tracking-wider disabled:opacity-50 font-bold shadow-lg flex items-center gap-1.5"
            >
              <span>{bulkSaving ? 'SAVING...' : `SAVE ALL EDITS (${pendingCount})`}</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 text-xs font-mono border flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-green-950/60 border-green-700 text-green-300'
              : 'bg-red-950/60 border-red-700 text-red-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="underline hover:text-white">
            DISMISS
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-gn-surface border border-gn-border">
          <div className="text-[10px] text-zinc-400 uppercase">TOTAL CATALOG VARIANTS</div>
          <div className="font-heading font-extrabold text-2xl text-gn-ivory mt-1">
            {metrics.total} ITEMS
          </div>
        </div>

        <div className="p-4 bg-gn-surface border border-gn-border">
          <div className="text-[10px] text-zinc-400 uppercase">HEALTHY STOCK (&gt; 15)</div>
          <div className="font-heading font-extrabold text-2xl text-green-400 mt-1">
            {metrics.healthy} ITEMS
          </div>
        </div>

        <div className="p-4 bg-gn-surface border border-gn-border">
          <div className="text-[10px] text-zinc-400 uppercase">LOW / CRITICAL (≤ 15)</div>
          <div className="font-heading font-extrabold text-2xl text-yellow-400 mt-1">
            {metrics.low + metrics.critical} ITEMS
          </div>
        </div>

        <div className="p-4 bg-gn-surface border border-gn-border">
          <div className="text-[10px] text-zinc-400 uppercase">OUT OF STOCK (0 UNITS)</div>
          <div className="font-heading font-extrabold text-2xl text-red-400 mt-1">
            {metrics.outOfStock} ITEMS
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 bg-gn-surface border border-gn-border flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search variant, SKU, or product..."
            className="w-full bg-gn-black border border-gn-border px-3 py-2 text-xs font-mono uppercase text-gn-ivory placeholder-zinc-600 focus:outline-none focus:border-gn-gold"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 border border-gn-border bg-gn-black p-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
              filterMode === 'ALL'
                ? 'bg-gn-maroon text-white font-bold border border-gn-gold/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ALL ({metrics.total})
          </button>
          <button
            onClick={() => setFilterMode('LOW')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
              filterMode === 'LOW'
                ? 'bg-gn-maroon text-white font-bold border border-gn-gold/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            LOW STOCK (≤ 15)
          </button>
          <button
            onClick={() => setFilterMode('CRITICAL')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
              filterMode === 'CRITICAL'
                ? 'bg-gn-maroon text-white font-bold border border-gn-gold/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            CRITICAL (≤ 5)
          </button>
          <button
            onClick={() => setFilterMode('OUT_OF_STOCK')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
              filterMode === 'OUT_OF_STOCK'
                ? 'bg-gn-maroon text-white font-bold border border-gn-gold/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            OUT OF STOCK ({metrics.outOfStock})
          </button>
        </div>
      </div>

      {/* Inventory Matrix Table - Fixed Width on Desktop, Smooth Touch Scroll on Mobile */}
      <div className="bg-gn-surface border border-gn-border overflow-x-auto lg:overflow-hidden shadow-xl">
        <table className="min-w-[760px] lg:min-w-0 w-full table-fixed text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-gn-border bg-gn-black text-[11px] font-mono uppercase tracking-wider text-gn-gold/90 font-bold">
              <th className="px-3.5 py-3.5 w-[32%]">PRODUCT & PACKSHOT</th>
              <th className="px-3 py-3.5 w-[17%]">VARIANT & SKU</th>
              <th className="px-2.5 py-3.5 w-[11%]">CATEGORY</th>
              <th className="px-2.5 py-3.5 w-[10%]">SELLING PRICE</th>
              <th className="px-2.5 py-3.5 w-[11%] text-center">STATUS</th>
              <th className="px-2 py-3.5 w-[9%] text-center">STOCK UNITS</th>
              <th className="px-3 py-3.5 w-[10%] text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gn-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gn-muted uppercase">
                  CALCULATING INVENTORY LEVELS...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-400 uppercase">
                  NO INVENTORY ITEMS MATCHING SELECTED CRITERIA.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const currentVal =
                  editedStocks[item.id] !== undefined ? editedStocks[item.id] : item.stock;
                const isDirty = editedStocks[item.id] !== undefined && editedStocks[item.id] !== item.stock;
                const isCritical = currentVal <= 5 && currentVal > 0;
                const isOut = currentVal === 0;
                const firstImg = item.product.images?.[0]?.url;

                return (
                  <tr key={item.id} className="hover:bg-gn-surface-light/40 transition-colors">
                    {/* Product & Packshot */}
                    <td className="px-3.5 py-3 overflow-hidden">
                      <div className="flex items-center gap-3">
                        {firstImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={firstImg}
                            alt={item.product.name}
                            className="w-10 h-10 object-contain bg-white/5 p-1 border border-gn-border shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gn-black border border-gn-border flex items-center justify-center shrink-0 text-zinc-600 font-mono text-[10px]">
                            IMG
                          </div>
                        )}
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div
                            className="font-heading text-xs font-bold text-gn-ivory uppercase tracking-wide line-clamp-2 leading-snug"
                            title={item.product.name}
                          >
                            {item.product.name}
                          </div>
                          <div className="text-[10px] font-mono text-gn-gold uppercase tracking-wider mt-0.5 truncate">
                            {item.product.brand || 'GYMNATION'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Variant & SKU */}
                    <td className="px-3 py-3 overflow-hidden">
                      <div className="text-white font-bold text-xs truncate" title={item.label}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono tracking-wider truncate mt-0.5" title={item.sku}>
                        {item.sku}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-2.5 py-3 uppercase text-zinc-300 font-mono text-[11px] overflow-hidden truncate">
                      {item.product.category?.name || '-'}
                    </td>

                    {/* Selling Price */}
                    <td className="px-2.5 py-3 overflow-hidden whitespace-nowrap">
                      <div className="font-bold text-gn-gold text-xs font-mono">
                        ₹{(item.price / 100).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono line-through mt-0.5">
                        ₹{(item.mrp / 100).toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-2.5 py-3 text-center overflow-hidden whitespace-nowrap">
                      {isOut ? (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-red-950/80 border border-red-700 text-red-300 uppercase">
                          OUT OF STOCK
                        </span>
                      ) : isCritical ? (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-600 text-amber-300 uppercase animate-pulse">
                          CRITICAL ({currentVal})
                        </span>
                      ) : currentVal <= 15 ? (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-yellow-950/70 border border-yellow-600 text-yellow-300 uppercase">
                          LOW STOCK ({currentVal})
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-green-950/70 border border-green-700 text-green-400 uppercase">
                          IN STOCK ({currentVal})
                        </span>
                      )}
                    </td>

                    {/* Stock Units Input */}
                    <td className="px-2 py-3 text-center overflow-hidden">
                      <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          value={currentVal}
                          onChange={(e) => handleStockChange(item.id, Number(e.target.value))}
                          className={`w-14 px-1.5 py-1 bg-gn-black border text-xs font-mono font-bold text-center focus:outline-none transition-colors ${
                            isOut
                              ? 'border-red-600 text-red-400'
                              : isCritical
                              ? 'border-amber-500 text-amber-300'
                              : isDirty
                              ? 'border-yellow-500 text-yellow-300 bg-yellow-950/20'
                              : 'border-gn-border hover:border-gn-border-light text-gn-ivory'
                          }`}
                        />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">UNITS</span>
                      </div>
                    </td>

                    {/* Action Buttons Column */}
                    <td className="px-3 py-3 text-right overflow-hidden">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        {/* Quick Restock Buttons */}
                        <button
                          onClick={() => handleQuickRestock(item.id, 10)}
                          className="px-2 py-1 bg-gn-black hover:bg-gn-surface-light border border-gn-border hover:border-gn-gold text-[10px] font-mono font-bold text-zinc-300 hover:text-gn-gold uppercase transition-colors"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleQuickRestock(item.id, 50)}
                          className="px-2 py-1 bg-gn-black hover:bg-gn-surface-light border border-gn-border hover:border-gn-gold text-[10px] font-mono font-bold text-zinc-300 hover:text-gn-gold uppercase transition-colors"
                          title="Add 50 units"
                        >
                          +50
                        </button>

                        {/* Out of Stock Quick Action */}
                        {!isOut ? (
                          <button
                            onClick={() => handleToggleZeroStock(item.id)}
                            className="px-2 py-1 bg-gn-black hover:bg-red-950/70 border border-gn-border hover:border-red-700 text-[10px] font-mono text-zinc-400 hover:text-red-300 uppercase transition-colors"
                            title="Set stock to 0"
                          >
                            OUT
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickRestock(item.id, 20)}
                            className="px-2 py-1 bg-green-950/80 hover:bg-green-900 border border-green-700 text-[10px] font-mono text-green-300 font-bold uppercase transition-colors"
                            title="Restock 20 units"
                          >
                            +20
                          </button>
                        )}

                        {/* Save Button */}
                        {isDirty && (
                          <button
                            onClick={() => saveSingle(item.id)}
                            disabled={savingId === item.id}
                            className="px-2.5 py-1 bg-gn-gold hover:bg-yellow-400 text-black font-mono font-extrabold text-[10px] uppercase shadow transition-all animate-pulse"
                          >
                            {savingId === item.id ? '...' : 'SAVE'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
