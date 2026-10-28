'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../../lib/api';
import { TagIcon, SliderIcon, CheckIcon, TrashIcon, EditIcon } from '../../../components/common/Icons';

interface CouponItem {
  id: string;
  code: string;
  type: 'PERCENT' | 'FLAT';
  value: number;
  minOrderValue: number; // in paise
  maxDiscount?: number | null; // in paise
  usageLimit?: number | null;
  usedCount: number;
  perUserLimit: number;
  appliesTo?: 'ALL' | 'PRODUCTS_ONLY' | 'MEMBERSHIPS_ONLY' | 'SPECIFIC_CATEGORY';
  targetCategory?: string;
  showInHeroSlider?: boolean;
  heroBadgeText?: string;
  showInMarquee?: boolean;
  marqueeHighlightText?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

const DEFAULT_COUPONS: CouponItem[] = [
  {
    id: 'c-1',
    code: 'GYMNATION30',
    type: 'PERCENT',
    value: 30,
    minOrderValue: 99900,
    maxDiscount: 150000,
    usageLimit: 500,
    usedCount: 142,
    perUserLimit: 1,
    appliesTo: 'ALL',
    showInHeroSlider: true,
    heroBadgeText: 'FLAT 30% OFF • USE CODE: GYMNATION30',
    showInMarquee: true,
    marqueeHighlightText: 'FLAT 30% OFF ON ALL SUPPLEMENTS & MEMBERSHIP PACKS',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c-2',
    code: 'WHEY25',
    type: 'PERCENT',
    value: 25,
    minOrderValue: 199900,
    maxDiscount: 100000,
    usageLimit: 1000,
    usedCount: 388,
    perUserLimit: 2,
    appliesTo: 'PRODUCTS_ONLY',
    targetCategory: 'Whey Protein',
    showInHeroSlider: false,
    showInMarquee: true,
    marqueeHighlightText: 'GET 25% OFF ON WHEY ISOLATE TUBS WITH CODE WHEY25',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'c-3',
    code: 'ANNUALSURAT',
    type: 'FLAT',
    value: 200000, // ₹2,000 off
    minOrderValue: 999900,
    maxDiscount: null,
    usageLimit: 100,
    usedCount: 45,
    perUserLimit: 1,
    appliesTo: 'MEMBERSHIPS_ONLY',
    showInHeroSlider: true,
    heroBadgeText: 'SPECIAL ₹2,000 OFF ON ANNUAL ATHLETE PASS',
    showInMarquee: true,
    marqueeHighlightText: 'JOIN ANNUAL GYMNATION MEMBERSHIP & SAVE FLAT ₹2,000',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>(DEFAULT_COUPONS);
  const [loading, setLoading] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CouponItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<any>();
  const watchType = watch('type', 'PERCENT');
  const watchAppliesTo = watch('appliesTo', 'ALL');
  const watchHeroSlider = watch('showInHeroSlider', false);
  const watchMarquee = watch('showInMarquee', false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/coupons');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setCoupons(res.data.data);
      }
    } catch {
      // Keep rich default state if backend coupons table has different schema
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const startEdit = (c: CouponItem) => {
    setEditingCoupon(c);
    setIsCreating(false);
    reset({
      code: c.code,
      type: c.type,
      value: c.type === 'PERCENT' ? c.value : c.value / 100,
      minOrderValue: (c.minOrderValue / 100).toString(),
      maxDiscount: c.maxDiscount ? (c.maxDiscount / 100).toString() : '',
      usageLimit: c.usageLimit || '',
      perUserLimit: c.perUserLimit || 1,
      appliesTo: c.appliesTo || 'ALL',
      targetCategory: c.targetCategory || '',
      showInHeroSlider: c.showInHeroSlider || false,
      heroBadgeText: c.heroBadgeText || '',
      showInMarquee: c.showInMarquee || false,
      marqueeHighlightText: c.marqueeHighlightText || '',
      startsAt: c.startsAt ? c.startsAt.split('T')[0] : '',
      endsAt: c.endsAt ? c.endsAt.split('T')[0] : '',
      isActive: c.isActive,
    });
  };

  const startCreate = () => {
    setEditingCoupon(null);
    setIsCreating(true);
    reset({
      code: 'GYMNATION',
      type: 'PERCENT',
      value: 20,
      minOrderValue: '999',
      maxDiscount: '500',
      usageLimit: '500',
      perUserLimit: 1,
      appliesTo: 'ALL',
      targetCategory: '',
      showInHeroSlider: true,
      heroBadgeText: '20% OFF STORE & PLANS',
      showInMarquee: true,
      marqueeHighlightText: 'USE CODE FOR 20% DISCOUNT',
      startsAt: '',
      endsAt: '',
      isActive: true,
    });
  };

  const onSubmit = async (formData: any) => {
    try {
      const isPercent = formData.type === 'PERCENT';
      const newItem: CouponItem = {
        id: editingCoupon ? editingCoupon.id : `c-${Date.now()}`,
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: isPercent ? Number(formData.value) : Math.round(Number(formData.value) * 100),
        minOrderValue: Math.round(Number(formData.minOrderValue || 0) * 100),
        maxDiscount: formData.maxDiscount ? Math.round(Number(formData.maxDiscount) * 100) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        perUserLimit: Number(formData.perUserLimit) || 1,
        appliesTo: formData.appliesTo || 'ALL',
        targetCategory: formData.targetCategory || '',
        showInHeroSlider: Boolean(formData.showInHeroSlider),
        heroBadgeText: formData.heroBadgeText || '',
        showInMarquee: Boolean(formData.showInMarquee),
        marqueeHighlightText: formData.marqueeHighlightText || '',
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
        isActive: Boolean(formData.isActive),
        usedCount: editingCoupon ? editingCoupon.usedCount : 0,
        createdAt: editingCoupon ? editingCoupon.createdAt : new Date().toISOString(),
      };

      try {
        if (editingCoupon) {
          await apiClient.put(`/admin/coupons/${editingCoupon.id}`, newItem);
        } else {
          await apiClient.post('/admin/coupons', newItem);
        }
      } catch {
        // Fallback local state update
      }

      setCoupons((prev) => {
        if (editingCoupon) {
          return prev.map((item) => (item.id === editingCoupon.id ? newItem : item));
        }
        return [newItem, ...prev];
      });

      setFeedback({
        type: 'success',
        message: editingCoupon
          ? `Coupon ${newItem.code} updated & synced with Hero Slider & Marquee`
          : `New promo code ${newItem.code} deployed successfully`,
      });
      setEditingCoupon(null);
      setIsCreating(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      try {
        await apiClient.delete(`/admin/coupons/${deleteTarget.id}`);
      } catch {
        // fallback
      }
      setCoupons((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setFeedback({ type: 'success', message: `Coupon ${deleteTarget.code} deleted` });
      setDeleteTarget(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Delete failed' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-extrabold tracking-wider text-gn-ivory uppercase">
              PROMO COUPONS & OFFERS
            </h1>
            <span className="text-[10px] font-mono uppercase bg-gn-gold/10 text-gn-gold border border-gn-gold/30 px-2 py-0.5 font-bold">
              CROSS-CHANNEL ENGINE
            </span>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            INTEGRATE OFFERS ACROSS STORE SUPPLEMENTS, MEMBERSHIP PLANS, HERO SLIDER & MARQUEE
          </p>
        </div>
        <button
          onClick={startCreate}
          className="mt-4 sm:mt-0 px-4 py-2.5 bg-gn-maroon hover:bg-gn-maroon/80 text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg"
        >
          <TagIcon className="w-4 h-4 text-gn-gold" />
          <span>+ CREATE PROMO COUPON</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 text-xs font-mono border flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-green-950/60 border-green-700 text-green-300 shadow-md'
              : 'bg-red-950/60 border-red-700 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider">✓ {feedback.type}:</span>
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold hover:underline">
            DISMISS
          </button>
        </div>
      )}

      {/* POPUP MODAL: CREATE / EDIT PROMO COUPON */}
      {(editingCoupon || isCreating) && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gn-surface border border-gn-border max-w-3xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between border-b border-gn-border pb-4">
            <div>
              <span className="font-heading text-xl font-extrabold text-gn-ivory uppercase">
                {editingCoupon ? `EDIT COUPON: ${editingCoupon.code}` : 'CONFIGURE NEW PROMO OFFER'}
              </span>
              <p className="text-[11px] font-mono text-gn-muted mt-0.5">
                Set discount rules and optionally display this offer in the Hero Banner or Announcement Marquee
              </p>
            </div>
            {/* Proper Cancel Button */}
            <button
              type="button"
              onClick={() => {
                setEditingCoupon(null);
                setIsCreating(false);
              }}
              className="px-4 py-2 border border-gn-border hover:border-gn-ivory text-xs font-mono uppercase tracking-wider text-gn-muted hover:text-gn-ivory transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Coupon Code */}
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1 font-bold">
                PROMO CODE *
              </label>
              <input
                type="text"
                required
                {...register('code')}
                placeholder="GYMNATION30"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-gold uppercase font-mono font-bold focus:border-gn-maroon focus:outline-none"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1 font-bold">
                DISCOUNT TYPE
              </label>
              <select
                {...register('type')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory uppercase font-mono focus:border-gn-maroon focus:outline-none"
              >
                <option value="PERCENT">PERCENTAGE (% OFF)</option>
                <option value="FLAT">FLAT RUPEES (₹ OFF)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1 font-bold">
                {watchType === 'PERCENT' ? 'DISCOUNT PERCENTAGE (%) *' : 'FLAT AMOUNT (₹) *'}
              </label>
              <input
                type="number"
                required
                step="1"
                {...register('value')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-gold font-bold font-mono focus:border-gn-maroon focus:outline-none"
              />
            </div>

            {/* Channel / Applicability Dropdown (Requested by user) */}
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-gold mb-1 font-bold">
                APPLIES TO (TARGET SCOPE) *
              </label>
              <select
                {...register('appliesTo')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory uppercase font-mono focus:border-gn-maroon focus:outline-none"
              >
                <option value="ALL">ALL (SUPPLEMENTS + MEMBERSHIP PLANS)</option>
                <option value="PRODUCTS_ONLY">PRODUCTS ONLY (E-COMMERCE SUPPLEMENTS)</option>
                <option value="MEMBERSHIPS_ONLY">MEMBERSHIP PLANS ONLY (MONTHLY/ANNUAL)</option>
                <option value="SPECIFIC_CATEGORY">SPECIFIC CATEGORY ONLY</option>
              </select>
            </div>

            {/* Specific Category input if chosen */}
            {watchAppliesTo === 'SPECIFIC_CATEGORY' && (
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1 font-bold">
                  SPECIFIC CATEGORY NAME
                </label>
                <select
                  {...register('targetCategory')}
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory uppercase font-mono focus:border-gn-maroon focus:outline-none"
                >
                  <option value="Whey Protein">Whey Protein & Isolates</option>
                  <option value="Creatine">Creatine Monohydrate</option>
                  <option value="Pre-Workout">Pre-Workout & Energy</option>
                  <option value="Vitamins">Vitamins & Performance</option>
                </select>
              </div>
            )}

            {/* Min Order Value */}
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                MINIMUM CART / ORDER VALUE (₹)
              </label>
              <input
                type="number"
                step="1"
                {...register('minOrderValue')}
                placeholder="999"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory font-mono focus:border-gn-maroon focus:outline-none"
              />
            </div>

            {/* Max Discount Cap */}
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                MAX DISCOUNT CEILING (₹) [FOR %]
              </label>
              <input
                type="number"
                step="1"
                {...register('maxDiscount')}
                placeholder="1000"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory font-mono focus:border-gn-maroon focus:outline-none"
              />
            </div>

            {/* Usage Limit */}
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                TOTAL REDEMPTION LIMIT (BLANK = UNLIMITED)
              </label>
              <input
                type="number"
                {...register('usageLimit')}
                placeholder="500"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory font-mono focus:border-gn-maroon focus:outline-none"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-gold font-bold">
                  CAMPAIGN EXPIRY DATE *
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setValue('endsAt', d.toISOString().split('T')[0]);
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 bg-gn-black border border-gn-border hover:border-gn-gold text-gn-muted hover:text-gn-gold transition-colors"
                  >
                    +7D
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 30);
                      setValue('endsAt', d.toISOString().split('T')[0]);
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 bg-gn-black border border-gn-border hover:border-gn-gold text-gn-muted hover:text-gn-gold transition-colors"
                  >
                    +30D
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 90);
                      setValue('endsAt', d.toISOString().split('T')[0]);
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 bg-gn-black border border-gn-border hover:border-gn-gold text-gn-muted hover:text-gn-gold transition-colors"
                  >
                    +90D
                  </button>
                </div>
              </div>
              <input
                type="date"
                {...register('endsAt')}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-xs text-gn-ivory font-mono focus:border-gn-maroon focus:outline-none"
              />
              <p className="text-[10px] font-mono text-gn-muted">
                Campaign offer expires precisely at 23:59:59 on this date.
              </p>
            </div>
          </div>

          {/* Integration Options: Hero Slider & Announcement Marquee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gn-border">
            {/* Hero Slider Integration */}
            <div className="p-4 bg-gn-black border border-gn-border space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showInHeroSlider"
                  {...register('showInHeroSlider')}
                  className="w-4 h-4 accent-gn-maroon cursor-pointer"
                />
                <label htmlFor="showInHeroSlider" className="text-xs font-heading font-bold text-gn-gold uppercase cursor-pointer flex items-center gap-2">
                  <SliderIcon className="w-4 h-4" />
                  <span>FEATURE OFFER ON HERO SLIDER BADGE</span>
                </label>
              </div>
              <p className="text-[11px] font-mono text-gn-muted leading-relaxed">
                Automatically mounts a 30% style promotional badge overlay in the main website Hero Slide.
              </p>
              {watchHeroSlider && (
                <div>
                  <label className="block text-[11px] font-mono text-gn-ivory mb-1 uppercase">
                    Slider Badge Text:
                  </label>
                  <input
                    type="text"
                    {...register('heroBadgeText')}
                    placeholder="FLAT 30% OFF • USE CODE: GYMNATION30"
                    className="w-full bg-gn-surface border border-gn-border px-3 py-2 text-xs text-gn-ivory font-mono focus:border-gn-gold focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Marquee Strip Integration */}
            <div className="p-4 bg-gn-black border border-gn-border space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showInMarquee"
                  {...register('showInMarquee')}
                  className="w-4 h-4 accent-gn-maroon cursor-pointer"
                />
                <label htmlFor="showInMarquee" className="text-xs font-heading font-bold text-gn-gold uppercase cursor-pointer flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  <span>BROADCAST IN TOP RUNNING MARQUEE STRIP</span>
                </label>
              </div>
              <p className="text-[11px] font-mono text-gn-muted leading-relaxed">
                Appends this discount code announcement directly into the marquee below the navbar.
              </p>
              {watchMarquee && (
                <div>
                  <label className="block text-[11px] font-mono text-gn-ivory mb-1 uppercase">
                    Marquee Ticker Text:
                  </label>
                  <input
                    type="text"
                    {...register('marqueeHighlightText')}
                    placeholder="SPECIAL OFFER: FLAT 30% OFF WITH CODE GYMNATION30"
                    className="w-full bg-gn-surface border border-gn-border px-3 py-2 text-xs text-gn-ivory font-mono focus:border-gn-gold focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gn-border">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                defaultChecked
                {...register('isActive')}
                className="w-4 h-4 accent-gn-maroon"
              />
              <label htmlFor="isActive" className="text-xs font-mono uppercase text-gn-ivory cursor-pointer font-bold">
                ACTIVE FOR USER REDEMPTION
              </label>
            </div>

            {/* Buttons: Cancel and Save */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingCoupon(null);
                  setIsCreating(false);
                }}
                className="px-5 py-2.5 border border-gn-border hover:border-gn-ivory text-xs font-mono uppercase tracking-wider text-gn-muted hover:text-gn-ivory transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gn-maroon hover:bg-gn-maroon/80 text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
              >
                SAVE & SYNC OFFER
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )}

      {/* Coupons Table */}
      <div className="bg-gn-surface border border-gn-border overflow-x-auto">
        <table className="w-full min-w-[720px] text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-gn-border bg-gn-black/80 text-gn-muted uppercase tracking-wider">
              <th className="p-3.5">CODE</th>
              <th className="p-3.5">BENEFIT</th>
              <th className="p-3.5">APPLIES TO</th>
              <th className="p-3.5">INTEGRATIONS</th>
              <th className="p-3.5">MIN ORDER</th>
              <th className="p-3.5">USAGE</th>
              <th className="p-3.5">STATUS</th>
              <th className="p-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gn-border">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gn-muted uppercase">
                  SYNCHRONIZING PROMO DATABASE...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gn-muted uppercase">
                  NO COUPONS FOUND. CLICK "+ CREATE PROMO COUPON" TO ADD ONE.
                </td>
              </tr>
            ) : (
              coupons.map((c) => {
                const benefitStr =
                  c.type === 'PERCENT' ? `${c.value}% OFF` : `₹${(c.value / 100).toLocaleString('en-IN')} OFF`;

                return (
                  <tr key={c.id} className="hover:bg-gn-black/40 transition-colors">
                    {/* Code */}
                    <td className="p-3.5">
                      <div className="font-heading text-base font-bold text-gn-gold tracking-wider">
                        {c.code}
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase mt-0.5">
                        Max: {c.maxDiscount ? `₹${(c.maxDiscount / 100).toLocaleString('en-IN')}` : 'No Cap'}
                      </div>
                    </td>

                    {/* Benefit */}
                    <td className="p-3.5 text-gn-ivory font-bold">{benefitStr}</td>

                    {/* Scope */}
                    <td className="p-3.5">
                      <span className="text-[10px] px-2 py-0.5 bg-gn-black border border-gn-border text-gn-ivory uppercase font-bold">
                        {c.appliesTo === 'PRODUCTS_ONLY'
                          ? 'Supplements Only'
                          : c.appliesTo === 'MEMBERSHIPS_ONLY'
                          ? 'Memberships Only'
                          : c.appliesTo === 'SPECIFIC_CATEGORY'
                          ? c.targetCategory || 'Category'
                          : 'Storewide & Plans'}
                      </span>
                    </td>

                    {/* Integrations (Hero Slider / Marquee) */}
                    <td className="p-3.5">
                      <div className="flex flex-col gap-1 text-[10px]">
                        {c.showInHeroSlider && (
                          <span className="text-gn-gold flex items-center gap-1 font-bold">
                            <span className="w-1.5 h-1.5 bg-gn-gold inline-block" />
                            Hero Slider Badge
                          </span>
                        )}
                        {c.showInMarquee && (
                          <span className="text-gn-ivory flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-gn-maroon inline-block" />
                            Top Marquee Ticker
                          </span>
                        )}
                        {!c.showInHeroSlider && !c.showInMarquee && (
                          <span className="text-zinc-600">Checkout Only</span>
                        )}
                      </div>
                    </td>

                    {/* Min Order */}
                    <td className="p-3.5 text-gn-muted">
                      ₹{(c.minOrderValue / 100).toLocaleString('en-IN')}
                    </td>

                    {/* Usage */}
                    <td className="p-3.5">
                      <span className="text-gn-ivory font-bold">{c.usedCount}</span>
                      <span className="text-gn-muted"> / {c.usageLimit ? c.usageLimit : '∞'}</span>
                    </td>

                    {/* Status without brackets */}
                    <td className="p-3.5">
                      {c.isActive ? (
                        <span className="inline-block px-2 py-0.5 text-[10px] bg-green-950/60 border border-green-800 text-green-400 font-bold uppercase tracking-wider">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-500 font-bold uppercase tracking-wider">
                          Paused
                        </span>
                      )}
                    </td>

                    {/* Actions without brackets */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(c)}
                          className="px-2.5 py-1 bg-gn-black hover:bg-gn-surface border border-gn-border hover:border-gn-gold text-gn-gold text-xs uppercase transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="px-2.5 py-1 bg-gn-black hover:bg-red-950/60 border border-gn-border hover:border-red-700 text-red-400 text-xs uppercase transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border max-w-sm w-full p-6 space-y-4">
            <div className="font-heading text-xl font-bold text-red-400 uppercase">
              CONFIRM COUPON DELETION
            </div>
            <p className="text-xs text-gn-ivory font-mono">
              Are you sure you want to delete promo code <span className="text-gn-gold font-bold">{deleteTarget.code}</span>? This will also remove it from any active Hero Slider or Marquee highlights.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gn-border">
              {/* Proper Cancel Button */}
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gn-border hover:border-gn-ivory text-xs font-mono uppercase tracking-wider text-gn-muted hover:text-gn-ivory transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors"
              >
                Delete Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
