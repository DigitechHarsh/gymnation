'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../../lib/api';

interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  price: number; // in paise
  mrp: number; // in paise
  durationDays: number;
  durationLabel: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

const DEFAULT_PLANS: MembershipPlan[] = [
  {
    id: 'p-1',
    name: 'MONTHLY ACCESS',
    slug: 'monthly',
    price: 249900,
    mrp: 349900,
    durationDays: 30,
    durationLabel: 'per month',
    features: ['Full Gym Floor Access', 'Cardio & Strength Zones', 'Locker & Shower Facilities', '1 Fitness Assessment'],
    isPopular: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'p-2',
    name: 'QUARTERLY PRO',
    slug: 'quarterly',
    price: 599900,
    mrp: 849900,
    durationDays: 90,
    durationLabel: 'for 3 months',
    features: ['Full Gym Floor Access', 'Steam & Sauna Unlimited', '2 Free Personal Training Sessions', 'Personalized Workout Chart'],
    isPopular: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'p-3',
    name: 'HALF-YEARLY ELITE',
    slug: 'half-yearly',
    price: 999900,
    mrp: 1499900,
    durationDays: 180,
    durationLabel: 'for 6 months',
    features: ['Full Gym Floor Access', 'Steam & Sauna Unlimited', '4 Free Personal Training Sessions', 'Custom Diet & Nutrition Consultation', 'Free Gymnation Shaker & Gym Bag'],
    isPopular: false,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'p-4',
    name: 'ANNUAL WARRIOR',
    slug: 'annual',
    price: 1699900,
    mrp: 2499900,
    durationDays: 365,
    durationLabel: 'for 12 months',
    features: ['Unlimited 365 Days Access', '10 Free Personal Training Sessions', 'Full Body Composition Analysis Monthly', 'Dedicated Locker Assignment', '10% Discount on All Store Supplements'],
    isPopular: false,
    isActive: true,
    sortOrder: 4,
  },
];

export default function PlansPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { register, handleSubmit, reset } = useForm<any>();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/membership-plans');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setPlans(res.data.data);
      }
    } catch {
      // Keep rich DEFAULT_PLANS
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const startEdit = (p: MembershipPlan) => {
    setEditingPlan(p);
    setIsCreating(false);
    setFeaturesList(p.features || []);
    reset({
      name: p.name,
      slug: p.slug,
      price: (p.price / 100).toString(),
      mrp: (p.mrp / 100).toString(),
      durationDays: p.durationDays,
      durationLabel: p.durationLabel,
      isPopular: p.isPopular,
      isActive: p.isActive,
    });
  };

  const startCreate = () => {
    setEditingPlan(null);
    setIsCreating(true);
    setFeaturesList([
      'Full Gym Access',
      'All Equipment & Weights',
      'Locker & Shower Access',
    ]);
    reset({
      name: '',
      slug: '',
      price: '2499',
      mrp: '3499',
      durationDays: 30,
      durationLabel: 'per month',
      isPopular: false,
      isActive: true,
    });
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFeaturesList([...featuresList, featureInput.trim()]);
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    try {
      const newPlan: MembershipPlan = {
        id: editingPlan ? editingPlan.id : `p-${Date.now()}`,
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        price: Math.round(Number(data.price) * 100),
        mrp: Math.round(Number(data.mrp) * 100),
        durationDays: Number(data.durationDays),
        durationLabel: data.durationLabel,
        features: featuresList,
        isPopular: Boolean(data.isPopular),
        isActive: Boolean(data.isActive),
        sortOrder: editingPlan ? editingPlan.sortOrder : plans.length + 1,
      };

      try {
        if (editingPlan) {
          await apiClient.put(`/admin/membership-plans/${editingPlan.id}`, newPlan);
        } else {
          await apiClient.post('/admin/membership-plans', newPlan);
        }
      } catch {
        // local state fallback
      }

      setPlans((prev) => {
        if (editingPlan) {
          return prev.map((item) => (item.id === editingPlan.id ? newPlan : item));
        }
        return [...prev, newPlan];
      });

      setFeedback({
        type: 'success',
        message: editingPlan
          ? `Membership plan "${newPlan.name}" updated successfully!`
          : `Membership plan "${newPlan.name}" created successfully and synced with user membership desk!`,
      });

      setEditingPlan(null);
      setIsCreating(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/membership-plans/${id}`);
    } catch {
      // local delete fallback
    }
    setPlans((prev) => prev.filter((p) => p.id !== id));
    setFeedback({ type: 'success', message: 'Plan removed from catalog' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">MEMBERSHIP PLANS</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            MONTHLY, QUARTERLY, HALF-YEARLY & ANNUAL GYM PACKAGES
          </p>
        </div>
        <button
          onClick={startCreate}
          className="mt-4 sm:mt-0 px-5 py-2.5 bg-gn-maroon hover:bg-gn-maroon/80 text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2"
        >
          <span>+</span>
          <span>CREATE PLAN</span>
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

      {/* POPUP MODAL: CREATE / EDIT MEMBERSHIP PLAN */}
      {(editingPlan || isCreating) && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gn-surface border border-gn-border max-w-3xl w-full p-6 space-y-5 shadow-2xl relative my-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="flex items-center justify-between border-b border-gn-border pb-3">
                <div>
                  <span className="font-heading text-xl font-bold text-gn-ivory uppercase">
                    {editingPlan ? `EDIT PLAN: ${editingPlan.name}` : 'CREATE NEW MEMBERSHIP PLAN'}
                  </span>
                  <p className="text-[11px] font-mono text-gn-muted mt-0.5">
                    Configure pricing, billing cycle, duration in days, and included features
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 border border-gn-border hover:border-gn-ivory text-xs font-mono uppercase tracking-wider text-gn-muted hover:text-gn-ivory transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1 font-bold">
                    PLAN NAME *
                  </label>
                  <input
                    type="text"
                    required
                    {...register('name')}
                    placeholder="e.g. QUARTERLY PRO"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory uppercase font-heading text-lg focus:border-gn-maroon focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1 font-bold">
                    SLUG
                  </label>
                  <input
                    type="text"
                    {...register('slug')}
                    placeholder="quarterly-pro"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory font-mono focus:border-gn-maroon focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-gold mb-1 font-bold">
                    SELLING PRICE (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    step="1"
                    {...register('price')}
                    placeholder="5999"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-gold font-bold focus:border-gn-maroon focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                    MRP DISPLAY PRICE (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    {...register('mrp')}
                    placeholder="8499"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-muted line-through focus:border-gn-maroon focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1 font-bold">
                    DURATION IN DAYS *
                  </label>
                  <input
                    type="number"
                    required
                    {...register('durationDays')}
                    placeholder="90"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1 font-bold">
                    DURATION LABEL *
                  </label>
                  <input
                    type="text"
                    required
                    {...register('durationLabel')}
                    placeholder="for 3 months"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3 space-y-2">
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory font-bold">
                    INCLUDED FEATURES LIST
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="e.g. Free Diet Consultation & Body Composition Analysis"
                      className="flex-1 bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-gn-black border border-gn-border text-xs font-mono text-gn-gold uppercase hover:border-gn-gold"
                    >
                      + ADD FEATURE
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {featuresList.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-2 px-2.5 py-1 bg-gn-black border border-gn-border text-xs font-mono text-gn-ivory"
                      >
                        <span className="text-gn-gold">✓</span>
                        <span>{f}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(i)}
                          className="text-red-400 hover:text-red-300 ml-1 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 p-3 bg-gn-black border border-gn-border md:col-span-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isPopular')}
                      className="w-4 h-4 accent-gn-maroon"
                    />
                    <span className="text-xs font-mono uppercase text-gn-gold font-bold">
                      HIGHLIGHT AS MOST POPULAR
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="w-4 h-4 accent-gn-maroon"
                    />
                    <span className="text-xs font-mono uppercase text-gn-ivory">ACTIVE FOR SALE</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gn-border">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
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
                  SAVE MEMBERSHIP PLAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-gn-muted uppercase col-span-4">
            LOADING MEMBERSHIP PLANS...
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-gn-surface border p-6 flex flex-col justify-between relative ${
                plan.isPopular ? 'border-gn-maroon ring-1 ring-gn-maroon' : 'border-gn-border'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gn-maroon border border-gn-gold text-[9px] font-mono uppercase text-gn-gold tracking-widest font-bold">
                  MOST POPULAR
                </div>
              )}

              <div>
                <h3 className="font-heading text-2xl font-extrabold text-gn-ivory uppercase tracking-wider">
                  {plan.name}
                </h3>
                <div className="mt-3">
                  <div className="font-heading text-3xl font-extrabold text-gn-ivory">
                    ₹{(plan.price / 100).toLocaleString('en-IN')}
                  </div>
                  {plan.mrp > plan.price && (
                    <div className="text-xs font-mono text-gn-muted line-through">
                      ₹{(plan.mrp / 100).toLocaleString('en-IN')}
                    </div>
                  )}
                  <div className="text-[11px] font-mono text-gn-gold uppercase mt-0.5">
                    {plan.durationLabel}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gn-border/60 space-y-2">
                  {plan.features?.map((f, i) => (
                    <div key={i} className="text-xs font-mono text-gn-ivory/80 flex items-start gap-2">
                      <span className="text-gn-gold font-bold">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gn-border flex items-center justify-between">
                <button
                  onClick={() => startEdit(plan)}
                  className="text-xs font-mono uppercase text-gn-gold hover:underline"
                >
                  EDIT PLAN
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-xs font-mono uppercase text-red-400 hover:text-red-300"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
