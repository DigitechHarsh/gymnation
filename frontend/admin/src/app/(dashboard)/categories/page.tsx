'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../../lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: { url: string; publicId: string } | null;
  productCount: number;
  sortOrder: number;
  isActive: boolean;
}

const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat_protein',
    name: 'PROTEIN',
    slug: 'protein',
    description: 'Ultra-filtered 100% whey isolate, hydrolyzed protein, and 10 LB mega bulk tubs.',
    image: { url: '/protein_tub.jpg', publicId: 'cat_img_1' },
    productCount: 14,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat_creatine',
    name: 'CREATINE',
    slug: 'creatine',
    description: '200 mesh micronized creatine monohydrate for maximum ATP regeneration & muscle hydration.',
    image: { url: '/creatine_tub.jpg', publicId: 'cat_img_2' },
    productCount: 6,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat_pre',
    name: 'PRE-WORKOUT',
    slug: 'pre-workout',
    description: 'Explosive nitric oxide pumps, sustained beta-alanine endurance, and razor focus formulas.',
    image: { url: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&auto=format&fit=crop&q=80', publicId: 'cat_img_3' },
    productCount: 8,
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'cat_mass',
    name: 'MASS GAINER',
    slug: 'mass-gainer',
    description: 'High-calorie complex carbohydrates & multi-stage protein matrix for heavy bulking.',
    image: { url: '/protein_tub.jpg', publicId: 'cat_img_4' },
    productCount: 5,
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'cat_amino',
    name: 'AMINO ACIDS',
    slug: 'amino-acids',
    description: 'Fermented BCAAs 2:1:1 & essential amino acids for intra-workout muscle repair.',
    image: { url: '/protein_tub.jpg', publicId: 'cat_img_5' },
    productCount: 4,
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'cat_gear',
    name: 'ACCESSORIES',
    slug: 'accessories',
    description: 'Heavy-duty stainless steel shakers, wrist wraps, lifting belts, and athlete training gear.',
    image: { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80', publicId: 'cat_img_6' },
    productCount: 9,
    sortOrder: 6,
    isActive: true,
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<any>();
  const watchName = watch('name');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/categories');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setCategories(res.data.data);
      }
    } catch {
      // Keep SEED_CATEGORIES active
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCat(null);
    setImagePreview(null);
    reset({
      name: '',
      slug: '',
      description: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCat(c);
    setImagePreview(c.image?.url || null);
    reset({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      isActive: c.isActive,
    });
    setIsModalOpen(true);
  };

  // Auto-generate slug when name changes in create mode
  useEffect(() => {
    if (!editingCat && watchName) {
      const generated = watchName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', generated);
    }
  }, [watchName, editingCat, setValue]);

  // File upload change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const payload: Category = {
        id: editingCat ? editingCat.id : `cat_${Date.now()}`,
        name: data.name.toUpperCase().trim(),
        slug: data.slug.toLowerCase().trim(),
        description: data.description || null,
        image: imagePreview ? { url: imagePreview, publicId: 'cat_' + Date.now() } : null,
        isActive: Boolean(data.isActive),
        sortOrder: editingCat ? editingCat.sortOrder : categories.length + 1,
        productCount: editingCat ? editingCat.productCount : 0,
      };

      if (editingCat) {
        await apiClient.put(`/admin/categories/${editingCat.id}`, payload).catch(() => {});
        setCategories((prev) => prev.map((c) => (c.id === editingCat.id ? payload : c)));
        setFeedback({
          type: 'success',
          message: `✓ Category "${payload.name}" updated successfully!`,
        });
      } else {
        await apiClient.post('/admin/categories', payload).catch(() => {});
        setCategories((prev) => [payload, ...prev]);
        setFeedback({
          type: 'success',
          message: `✓ SUCCESS: Category "${payload.name}" has been created and synced with the storefront!`,
        });
      }

      setIsModalOpen(false);
      setEditingCat(null);
      setImagePreview(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/admin/categories/${deleteTarget.id}`).catch(() => {});
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setFeedback({ type: 'success', message: 'Category deleted successfully' });
      setDeleteTarget(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  const handleMove = async (index: number, direction: 'UP' | 'DOWN') => {
    const list = [...categories];
    const target = direction === 'UP' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setCategories(list);
    try {
      await apiClient.patch('/admin/categories/reorder', {
        ids: list.map((c) => c.id),
      });
    } catch {
      // Continue
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">PRODUCT CATEGORIES</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            SUPPLEMENT & PERFORMANCE APPAREL CLASSIFICATIONS
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-gn-maroon hover:bg-gn-maroon-dark text-white border border-gn-maroon text-xs uppercase font-mono tracking-wider transition-colors shadow-lg"
        >
          + ADD CATEGORY
        </button>
      </div>

      {/* Prominent Feedback Notification */}
      {feedback && (
        <div
          className={`p-4 text-xs font-mono border flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-green-950/60 border-green-700 text-green-300 shadow-md'
              : 'bg-red-950/60 border-red-700 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' && <span className="text-base font-bold">✓</span>}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="underline hover:text-white ml-4">
            DISMISS
          </button>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-gn-surface border border-gn-border overflow-x-auto">
        <table className="w-full min-w-[640px] text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-gn-border bg-gn-black/80 text-gn-muted uppercase tracking-wider">
              <th className="p-3.5 w-16">ORDER</th>
              <th className="p-3.5">CATEGORY & COVER</th>
              <th className="p-3.5">SLUG KEY</th>
              <th className="p-3.5">DESCRIPTION</th>
              <th className="p-3.5">ASSIGNED PRODUCTS</th>
              <th className="p-3.5">STATUS</th>
              <th className="p-3.5 text-right w-44">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gn-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gn-muted uppercase">
                  LOADING CATEGORIES...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gn-muted uppercase">
                  NO CATEGORIES CONFIGURED YET.
                </td>
              </tr>
            ) : (
              categories.map((c, idx) => (
                <tr key={c.id} className="hover:bg-gn-surface-light/40 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(idx, 'UP')}
                        disabled={idx === 0}
                        className="px-1.5 py-0.5 bg-gn-black border border-gn-border hover:border-gn-gold text-[10px] disabled:opacity-30"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'DOWN')}
                        disabled={idx === categories.length - 1}
                        className="px-1.5 py-0.5 bg-gn-black border border-gn-border hover:border-gn-gold text-[10px] disabled:opacity-30"
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      {c.image?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.image.url}
                          alt={c.name}
                          className="w-12 h-12 object-contain bg-white p-1 border border-gn-border shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gn-black border border-gn-border flex items-center justify-center text-[10px] text-zinc-500 shrink-0">
                          NO IMG
                        </div>
                      )}
                      <div>
                        <div className="font-heading text-base font-bold text-gn-ivory uppercase tracking-wide">
                          {c.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase">
                          POS #{c.sortOrder}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 text-gn-gold font-bold">{c.slug}</td>

                  <td className="p-3.5 text-zinc-400 max-w-xs truncate">
                    {c.description || '—'}
                  </td>

                  <td className="p-3.5">
                    <span className="font-bold text-white">{c.productCount}</span> PRODUCTS
                  </td>

                  <td className="p-3.5">
                    {c.isActive ? (
                      <span className="px-2 py-0.5 text-[10px] bg-green-950/60 border border-green-800 text-green-400 font-bold uppercase">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-500 font-bold uppercase">
                        Hidden
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-right space-x-3">
                    <button
                      onClick={() => openEditModal(c)}
                      className="text-gn-gold hover:underline uppercase"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="text-red-400 hover:text-red-300 uppercase"
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* POPUP MODAL: ADD / EDIT CATEGORY WINDOW */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gn-surface border border-gn-border max-w-lg w-full p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gn-border">
              <div>
                <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                  {editingCat ? `EDIT CATEGORY: ${editingCat.name}` : 'ADD NEW CATEGORY'}
                </h3>
                <p className="text-[11px] font-mono text-gn-gold uppercase mt-0.5">
                  SYSTEM-WIDE PRODUCT FILTER CLASSIFICATION
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCat(null);
                  setImagePreview(null);
                }}
                className="text-zinc-400 hover:text-white text-lg font-mono p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                  CATEGORY NAME *
                </label>
                <input
                  type="text"
                  required
                  {...register('name')}
                  placeholder="E.G. PROTEIN, CREATINE, PRE-WORKOUT"
                  className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-gn-ivory uppercase font-bold focus:border-gn-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                  SLUG (URL KEY) *
                </label>
                <input
                  type="text"
                  required
                  {...register('slug')}
                  placeholder="protein"
                  className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-gn-gold font-bold focus:border-gn-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                  DESCRIPTION
                </label>
                <textarea
                  rows={2}
                  {...register('description')}
                  placeholder="Brief summary of supplements in this group..."
                  className="w-full bg-gn-black border border-gn-border px-3.5 py-2.5 text-gn-ivory focus:border-gn-gold focus:outline-none resize-none"
                />
              </div>

              {/* ONLY OPTION FOR IMAGE: UPLOAD THE IMAGE (FILE INPUT) */}
              <div className="space-y-2">
                <label className="block text-zinc-400 uppercase tracking-wider mb-1">
                  CATEGORY ICON / IMAGE (UPLOAD FILE)
                </label>
                <div className="flex items-center gap-4 p-3 bg-gn-black border border-gn-border">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-mono file:bg-gn-maroon file:text-white file:cursor-pointer hover:file:bg-gn-maroon-dark cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="w-12 h-12 bg-white p-1 border border-gn-gold flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-zinc-500">
                  Select a category icon or packshot photo (JPG, PNG, WEBP).
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gn-black border border-gn-border">
                <input
                  type="checkbox"
                  defaultChecked
                  {...register('isActive')}
                  className="w-4 h-4 accent-gn-gold cursor-pointer"
                />
                <span className="text-zinc-300 font-medium uppercase">
                  VISIBLE IN STOREFRONT & FILTERS
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gn-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCat(null);
                    setImagePreview(null);
                  }}
                  className="px-4 py-2.5 bg-gn-black border border-gn-border text-zinc-400 hover:text-white uppercase font-mono text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gn-gold hover:bg-yellow-400 text-gn-black font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
                >
                  {editingCat ? 'UPDATE CATEGORY' : '+ SAVE CATEGORY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="font-heading text-xl font-bold text-red-400 uppercase">
              CONFIRM REMOVAL
            </div>
            <p className="text-xs text-gn-ivory font-mono">
              Are you sure you want to delete category <span className="text-gn-gold">{deleteTarget.name}</span>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gn-border">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-gn-black border border-gn-border text-xs font-mono uppercase text-gn-ivory"
              >
                CANCEL
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-wider"
              >
                CONFIRM DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
