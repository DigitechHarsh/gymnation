'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../../lib/api';

interface WhyUsItem {
  id: string;
  number: string;
  title: string;
  description: string;
  media?: { url: string; publicId: string } | null;
  sortOrder: number;
  isActive: boolean;
}

export default function WhyUsPage() {
  const [items, setItems] = useState<WhyUsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<WhyUsItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { register, handleSubmit, reset } = useForm<any>();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/why-us');
      setItems(res.data.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load Why Us items' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const startEdit = (item: WhyUsItem) => {
    setEditingItem(item);
    setIsCreating(false);
    reset({
      number: item.number,
      title: item.title,
      description: item.description,
      mediaUrl: item.media?.url || '',
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    });
  };

  const startCreate = () => {
    setEditingItem(null);
    setIsCreating(true);
    reset({
      number: `0${items.length + 1}`,
      title: '',
      description: '',
      mediaUrl: '',
      isActive: true,
      sortOrder: items.length + 1,
    });
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        number: data.number,
        title: data.title,
        description: data.description,
        media: data.mediaUrl ? { url: data.mediaUrl, publicId: 'why_us_' + Date.now() } : null,
        isActive: Boolean(data.isActive),
        sortOrder: Number(data.sortOrder) || 1,
      };

      if (editingItem) {
        await apiClient.put(`/admin/why-us/${editingItem.id}`, payload);
        setFeedback({ type: 'success', message: 'Item updated' });
      } else {
        await apiClient.post('/admin/why-us', payload);
        setFeedback({ type: 'success', message: 'Item created' });
      }

      setEditingItem(null);
      setIsCreating(false);
      fetchItems();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/why-us/${id}`);
      setFeedback({ type: 'success', message: 'Item deleted' });
      fetchItems();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">WHY GYMNATION</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            NUMBERED EDITORIAL VALUE PROPOSITIONS (01-05)
          </p>
        </div>
        {!editingItem && !isCreating && (
          <button
            onClick={startCreate}
            className="mt-4 sm:mt-0 px-4 py-2 bg-gn-maroon hover:bg-gn-maroon-dark text-white border border-gn-maroon text-xs uppercase font-mono tracking-wider transition-colors"
          >
            + ADD ROW
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
              {editingItem ? `EDIT ROW ${editingItem.number}: ${editingItem.title}` : 'ADD NEW WHY US CARD'}
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
                ROW NUMBER (e.g. 01, 02)
              </label>
              <input
                type="text"
                required
                {...register('number')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-gold focus:border-gn-maroon focus:outline-none font-bold font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                FEATURE TITLE
              </label>
              <input
                type="text"
                required
                {...register('title')}
                placeholder="EXPERT TRAINERS"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none font-heading text-lg uppercase"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                DESCRIPTION
              </label>
              <textarea
                rows={3}
                required
                {...register('description')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none leading-relaxed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                HOVER PHOTO URL
              </label>
              <input
                type="text"
                {...register('mediaUrl')}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-gn-black border border-gn-border">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4 accent-gn-maroon"
              />
              <span className="text-xs font-mono uppercase text-gn-ivory">ACTIVE ROW</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gn-maroon hover:bg-gn-maroon-dark text-white font-mono text-xs uppercase tracking-wider"
            >
              SAVE ROW
            </button>
          </div>
        </form>
      )}

      {/* Rows Table */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-gn-muted uppercase">
            LOADING WHY US ITEMS...
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              className="bg-gn-surface border border-gn-border p-5 flex items-center justify-between hover:border-gn-maroon transition-colors"
            >
              <div className="flex items-start gap-4">
                <span className="font-heading text-3xl font-extrabold text-gn-gold">
                  {it.number}
                </span>
                <div>
                  <h3 className="font-heading text-xl font-bold text-gn-ivory uppercase">
                    {it.title}
                  </h3>
                  <p className="text-xs text-gn-muted max-w-2xl mt-1 leading-relaxed">
                    {it.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => startEdit(it)}
                  className="px-3 py-1 bg-gn-black border border-gn-border text-xs font-mono uppercase text-gn-gold hover:border-gn-gold"
                >
                  EDIT
                </button>
                <button
                  onClick={() => handleDelete(it.id)}
                  className="px-3 py-1 bg-gn-black border border-gn-border text-xs font-mono uppercase text-red-400 hover:border-red-400"
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
