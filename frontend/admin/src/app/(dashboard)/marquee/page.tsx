'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';

interface MarqueeOffer {
  id: string;
  text: string;
  isActive: boolean;
  sortOrder: number;
}

export default function MarqueePage() {
  const [offers, setOffers] = useState<MarqueeOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/marquee');
      setOffers(res.data.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load offers' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    try {
      await apiClient.post('/admin/marquee', {
        text: newText.trim(),
        sortOrder: offers.length + 1,
        isActive: true,
      });
      setNewText('');
      setFeedback({ type: 'success', message: 'Marquee offer added' });
      fetchOffers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Create failed' });
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editText.trim()) return;
    try {
      await apiClient.put(`/admin/marquee/${id}`, {
        text: editText.trim(),
      });
      setEditingId(null);
      setFeedback({ type: 'success', message: 'Offer updated' });
      fetchOffers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Update failed' });
    }
  };

  const handleToggleActive = async (offer: MarqueeOffer) => {
    try {
      await apiClient.put(`/admin/marquee/${offer.id}`, {
        text: offer.text,
        isActive: !offer.isActive,
      });
      fetchOffers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Toggle failed' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/marquee/${id}`);
      setFeedback({ type: 'success', message: 'Offer deleted' });
      fetchOffers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  const handleMove = async (index: number, direction: 'UP' | 'DOWN') => {
    const list = [...offers];
    const target = direction === 'UP' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setOffers(list);
    try {
      await apiClient.patch('/admin/marquee/reorder', {
        ids: list.map((o) => o.id),
      });
    } catch {
      fetchOffers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">OFFER MARQUEE</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            SCROLLING ANNOUNCEMENT TICKER BELOW NAVBAR
          </p>
        </div>
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

      {/* Add Item Form */}
      <form onSubmit={handleCreate} className="bg-gn-surface border border-gn-border p-4 flex gap-3 items-center">
        <input
          type="text"
          required
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="e.g. FLAT 25% OFF ON PROTEIN / USE CODE GYMNATION25"
          className="flex-1 bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory uppercase focus:border-gn-maroon focus:outline-none"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-gn-maroon hover:bg-gn-maroon-dark text-white font-mono text-xs uppercase tracking-wider"
        >
          + ADD TICKER
        </button>
      </form>

      {/* Marquee Items Table */}
      <div className="bg-gn-surface border border-gn-border overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-gn-border bg-gn-black/80 text-gn-muted uppercase tracking-wider">
              <th className="p-3.5 w-16">ORDER</th>
              <th className="p-3.5">ANNOUNCEMENT TEXT</th>
              <th className="p-3.5">STATUS</th>
              <th className="p-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gn-border">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gn-muted uppercase">
                  LOADING TICKERS...
                </td>
              </tr>
            ) : (
              offers.map((offer, index) => (
                <tr key={offer.id} className="hover:bg-gn-surface-light/40 transition-colors">
                  <td className="p-3.5 text-gn-gold font-bold">
                    <div className="flex items-center gap-1">
                      <span>#{offer.sortOrder}</span>
                      <div className="flex flex-col ml-1">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMove(index, 'UP')}
                          className="text-[9px] hover:text-white disabled:opacity-20"
                        >
                          ▲
                        </button>
                        <button
                          disabled={index === offers.length - 1}
                          onClick={() => handleMove(index, 'DOWN')}
                          className="text-[9px] hover:text-white disabled:opacity-20"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    {editingId === offer.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 bg-gn-black border border-gn-border px-2 py-1 text-xs text-gn-ivory uppercase"
                        />
                        <button
                          onClick={() => handleUpdate(offer.id)}
                          className="px-2 py-1 bg-green-800 text-white text-[10px]"
                        >
                          SAVE
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-gn-black border border-gn-border text-[10px]"
                        >
                          CANCEL
                        </button>
                      </div>
                    ) : (
                      <span className="text-gn-ivory font-bold uppercase tracking-wider">
                        {offer.text}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggleActive(offer)}
                      className="cursor-pointer"
                    >
                      {offer.isActive ? (
                        <span className="px-2 py-0.5 text-[10px] bg-green-950/60 border border-green-800 text-green-400 font-bold uppercase">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-500 font-bold uppercase">Paused</span>
                      )}
                    </button>
                  </td>
                  <td className="p-3.5 text-right space-x-3">
                    <button
                      onClick={() => {
                        setEditingId(offer.id);
                        setEditText(offer.text);
                      }}
                      className="text-gn-gold hover:underline uppercase"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
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
    </div>
  );
}
