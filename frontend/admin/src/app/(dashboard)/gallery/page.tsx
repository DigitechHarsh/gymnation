'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../../lib/api';

interface GalleryItem {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  media: { url: string; publicId: string };
  caption: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { register, handleSubmit, reset } = useForm<any>();

  const fetchGallery = async (category = 'ALL') => {
    try {
      setLoading(true);
      const url = category === 'ALL' ? '/admin/gallery' : `/admin/gallery?category=${category}`;
      const res = await apiClient.get(url);
      setItems(res.data.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load gallery' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery(categoryFilter);
  }, [categoryFilter]);

  const onSubmit = async (data: any) => {
    try {
      await apiClient.post('/admin/gallery', {
        type: data.type,
        media: { url: data.mediaUrl, publicId: 'gallery_' + Date.now() },
        caption: data.caption,
        category: data.category.toUpperCase(),
        isActive: Boolean(data.isActive),
        sortOrder: items.length + 1,
      });
      setFeedback({ type: 'success', message: 'Gallery item added' });
      setShowAddForm(false);
      reset();
      fetchGallery(categoryFilter);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Create failed' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/gallery/${id}`);
      setFeedback({ type: 'success', message: 'Item deleted' });
      fetchGallery(categoryFilter);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">GALLERY MANAGEMENT</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            BENTO GRID MEDIA & LIGHTBOX REPOSITORY
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gn-maroon hover:bg-gn-maroon-dark text-white border border-gn-maroon text-xs uppercase font-mono tracking-wider transition-colors"
        >
          {showAddForm ? 'CANCEL' : '+ ADD GALLERY ITEM'}
        </button>
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

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'EQUIPMENT', 'WORKOUTS', 'MEMBERS', 'EVENTS'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-mono uppercase border transition-colors ${
              categoryFilter === cat
                ? 'bg-gn-maroon border-gn-maroon text-white font-bold'
                : 'bg-gn-surface border-gn-border text-gn-muted hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gn-surface border border-gn-border p-6 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-gn-gold border-b border-gn-border pb-2">
            ADD NEW GALLERY ASSET
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                MEDIA TYPE
              </label>
              <select
                {...register('type')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory uppercase font-mono"
              >
                <option value="IMAGE">IMAGE</option>
                <option value="VIDEO">VIDEO (MP4)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                CATEGORY
              </label>
              <select
                {...register('category')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory uppercase font-mono"
              >
                <option value="EQUIPMENT">EQUIPMENT</option>
                <option value="WORKOUTS">WORKOUTS</option>
                <option value="MEMBERS">MEMBERS</option>
                <option value="EVENTS">EVENTS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                MEDIA URL
              </label>
              <input
                type="text"
                required
                {...register('mediaUrl')}
                placeholder="https://images.unsplash.com/... or /video.mp4"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                CAPTION (APPEARS ON HOVER / LIGHTBOX)
              </label>
              <input
                type="text"
                required
                {...register('caption')}
                placeholder="Olympic Racks & Heavy Dumbbell Zone"
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
              <span className="text-xs font-mono uppercase text-gn-ivory">VISIBLE IN BENTO GRID</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-gn-maroon hover:bg-gn-maroon-dark text-white font-mono text-xs uppercase tracking-wider"
            >
              ADD TO GALLERY
            </button>
          </div>
        </form>
      )}

      {/* Gallery Bento Grid Display */}
      {loading ? (
        <div className="p-8 text-center text-xs font-mono text-gn-muted uppercase">
          LOADING GALLERY ITEMS...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-gn-surface border border-gn-border group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="aspect-[4/3] bg-gn-black relative overflow-hidden">
                {item.type === 'VIDEO' ? (
                  <video src={item.media?.url} controls className="w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.media?.url}
                    alt={item.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-gn-black/80 border border-gn-border text-[9px] font-mono uppercase text-gn-gold">
                  {item.category}
                </div>
              </div>

              <div className="p-3 border-t border-gn-border flex items-center justify-between">
                <span className="text-xs font-mono text-gn-ivory truncate max-w-[180px]">
                  {item.caption}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-[10px] font-mono uppercase text-red-400 hover:text-red-300"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
