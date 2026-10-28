'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../../lib/api';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  photo?: { url: string; publicId: string } | null;
  rating: number;
  isActive: boolean;
  sortOrder: number;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { register, handleSubmit, reset } = useForm<any>();

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/testimonials');
      setTestimonials(res.data.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load testimonials' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const startEdit = (t: Testimonial) => {
    setEditingItem(t);
    setIsCreating(false);
    reset({
      name: t.name,
      role: t.role,
      quote: t.quote,
      photoUrl: t.photo?.url || '',
      rating: t.rating,
      isActive: t.isActive,
      sortOrder: t.sortOrder,
    });
  };

  const startCreate = () => {
    setEditingItem(null);
    setIsCreating(true);
    reset({
      name: '',
      role: 'Member since 2025',
      quote: '',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
      rating: 5,
      isActive: true,
      sortOrder: testimonials.length + 1,
    });
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        role: data.role,
        quote: data.quote,
        photo: data.photoUrl ? { url: data.photoUrl, publicId: 'test_' + Date.now() } : null,
        rating: Number(data.rating) || 5,
        isActive: Boolean(data.isActive),
        sortOrder: Number(data.sortOrder) || 1,
      };

      if (editingItem) {
        await apiClient.put(`/admin/testimonials/${editingItem.id}`, payload);
        setFeedback({ type: 'success', message: 'Testimonial updated' });
      } else {
        await apiClient.post('/admin/testimonials', payload);
        setFeedback({ type: 'success', message: 'Testimonial created' });
      }

      setEditingItem(null);
      setIsCreating(false);
      fetchTestimonials();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/testimonials/${id}`);
      setFeedback({ type: 'success', message: 'Testimonial deleted' });
      fetchTestimonials();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">REAL PEOPLE / REAL RESULTS</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            CLIENT TESTIMONIALS & TRANSFORMATION QUOTES
          </p>
        </div>
        {!editingItem && !isCreating && (
          <button
            onClick={startCreate}
            className="mt-4 sm:mt-0 px-4 py-2 bg-gn-maroon hover:bg-gn-maroon-dark text-white border border-gn-maroon text-xs uppercase font-mono tracking-wider transition-colors"
          >
            + ADD TESTIMONIAL
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3 text-xs font-mono border ${
            feedback.type === 'success'
              ? 'bg-green-950/40 border-green-800 text-green-300'
              : 'bg-red-950/40 border-red-800 text-red-300'
          }`}
        >
          [{feedback.type.toUpperCase()}]: {feedback.message}
        </div>
      )}

      {(editingItem || isCreating) && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gn-surface border border-gn-border p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gn-border pb-3">
            <span className="font-heading text-xl font-bold text-gn-ivory uppercase">
              {editingItem ? `EDIT: ${editingItem.name}` : 'ADD NEW MEMBER TRANSFORMATION'}
            </span>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsCreating(false);
              }}
              className="px-4 py-2 border border-gn-border hover:border-gn-ivory text-xs font-mono uppercase tracking-wider text-gn-muted hover:text-gn-ivory transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                MEMBER NAME
              </label>
              <input
                type="text"
                required
                {...register('name')}
                placeholder="Rahul Varma"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                ROLE / RESULT TAGLINE
              </label>
              <input
                type="text"
                required
                {...register('role')}
                placeholder="Lost 18 kg in 6 Months"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-gold focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                RATING (1-5 STARS)
              </label>
              <select
                {...register('rating')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory uppercase font-mono"
              >
                <option value={5}>5 STARS (EXCELLENT)</option>
                <option value={4}>4 STARS (VERY GOOD)</option>
                <option value={3}>3 STARS (GOOD)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                PHOTO URL
              </label>
              <input
                type="text"
                {...register('photoUrl')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-gn-black border border-gn-border">
              <input
                type="checkbox"
                defaultChecked
                {...register('isActive')}
                className="w-4 h-4 accent-gn-maroon"
              />
              <span className="text-xs font-mono uppercase text-gn-ivory">VISIBLE IN QUOTE SLIDER</span>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                TESTIMONIAL QUOTE
              </label>
              <textarea
                rows={3}
                required
                {...register('quote')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gn-maroon hover:bg-gn-maroon-dark text-white font-mono text-xs uppercase tracking-wider"
            >
              SAVE TESTIMONIAL
            </button>
          </div>
        </form>
      )}

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-gn-muted uppercase col-span-2">
            LOADING TESTIMONIALS...
          </div>
        ) : (
          testimonials.map((t) => (
            <div key={t.id} className="bg-gn-surface border border-gn-border p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {t.photo?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.photo.url}
                        alt={t.name}
                        className="w-12 h-12 rounded-none border border-gn-border object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-heading text-lg font-bold text-gn-ivory uppercase">
                        {t.name}
                      </h3>
                      <div className="text-xs font-mono text-gn-gold uppercase">
                        {t.role}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gn-gold">
                    {'★'.repeat(t.rating)}
                  </div>
                </div>

                <p className="text-xs text-gn-ivory/80 italic mt-4 leading-relaxed font-sans border-l-2 border-gn-maroon pl-3">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gn-border flex items-center justify-between text-xs font-mono">
                <button
                  onClick={() => startEdit(t)}
                  className="text-gn-gold hover:underline uppercase"
                >
                  EDIT
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-red-400 hover:text-red-300 uppercase"
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
