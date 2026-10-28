'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';

interface SubscriberItem {
  id: string;
  email: string;
  createdAt: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<SubscriberItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 25 };
      if (search.trim()) params.search = search.trim();

      const res = await apiClient.get('/admin/subscribers', { params });
      if (res.data?.success) {
        setSubscribers(res.data.data.subscribers);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalCount(res.data.data.total || 0);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load subscribers' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubscribers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await apiClient.delete(`/admin/subscribers/${deleteTarget.id}`);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: 'Subscriber removed successfully' });
        setDeleteTarget(null);
        fetchSubscribers();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to remove subscriber' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gn-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl font-extrabold tracking-wider uppercase text-gn-ivory">
              NEWSLETTER SUBSCRIBERS
            </h1>
            <span className="text-xs font-mono uppercase bg-gn-maroon/30 text-gn-ivory px-2.5 py-1 border border-gn-maroon/60">
              {totalCount} SUBSCRIBERS
            </span>
          </div>
          <p className="text-xs text-gn-muted font-mono uppercase tracking-widest mt-1">
            VIP AUDIENCE FOR SUPPLEMENT LAUNCHES, DEALS, & GYM ANNOUNCEMENTS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5000/api/v1/admin/subscribers/export/csv"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gn-black border border-gn-border text-xs font-mono uppercase tracking-wider text-gn-ivory hover:border-gn-gold hover:text-gn-gold transition-colors"
          >
            EXPORT CSV
          </a>
          <button
            onClick={() => fetchSubscribers()}
            className="px-4 py-2 border border-gn-border text-xs font-mono uppercase tracking-wider text-gn-ivory hover:border-gn-gold transition-colors"
          >
            REFRESH
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 border text-xs font-mono uppercase tracking-wider flex justify-between items-center ${
            feedback.type === 'success'
              ? 'bg-green-950/40 border-green-800 text-green-300'
              : 'bg-red-950/40 border-red-800 text-red-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="underline hover:text-white">
            DISMISS
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-gn-surface p-4 border border-gn-border">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="SEARCH BY EMAIL ADDRESS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-gn-black border border-gn-border px-3 py-2 text-xs font-mono uppercase text-gn-ivory placeholder-zinc-600 focus:outline-none focus:border-gn-gold"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-gn-maroon hover:bg-gn-maroon/80 text-gn-ivory font-heading font-bold text-sm tracking-wider uppercase transition-colors"
          >
            SEARCH
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setPage(1);
                fetchSubscribers();
              }}
              className="px-3 py-2 border border-gn-border text-xs font-mono uppercase text-gn-muted hover:text-white"
            >
              CLEAR
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="border border-gn-border bg-gn-surface overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gn-border bg-gn-black/60 text-[11px] font-mono uppercase tracking-widest text-gn-muted">
              <th className="p-4">#</th>
              <th className="p-4">SUBSCRIBER EMAIL</th>
              <th className="p-4">SUBSCRIBED DATE & TIME</th>
              <th className="p-4 text-center">STATUS</th>
              <th className="p-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gn-border text-xs">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gn-muted font-mono uppercase tracking-widest">
                  FETCHING SUBSCRIBERS...
                </td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gn-muted font-mono uppercase tracking-widest">
                  NO SUBSCRIBERS FOUND.
                </td>
              </tr>
            ) : (
              subscribers.map((s, idx) => (
                <tr key={s.id} className="hover:bg-gn-black/40 transition-colors">
                  <td className="p-4 font-mono text-zinc-500 text-[11px]">
                    {(page - 1) * 25 + idx + 1}
                  </td>
                  <td className="p-4 font-mono font-bold text-gn-ivory">
                    {s.email}
                  </td>
                  <td className="p-4 font-mono text-zinc-400 text-[11px]">
                    {new Date(s.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-green-800 text-green-400 bg-green-950/40">
                      SUBSCRIBED
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="px-3 py-1 bg-gn-black border border-red-900/60 text-[11px] font-mono uppercase tracking-wider text-red-400 hover:border-red-600 transition-colors"
                    >
                      REMOVE
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gn-border flex items-center justify-between bg-gn-black/40">
            <span className="text-xs font-mono uppercase text-gn-muted">
              PAGE {page} OF {totalPages} ({totalCount} SUBSCRIBERS TOTAL)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-gn-surface border border-gn-border text-xs font-mono uppercase text-gn-ivory disabled:opacity-30 disabled:cursor-not-allowed hover:border-gn-gold"
              >
                PREVIOUS
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-gn-surface border border-gn-border text-xs font-mono uppercase text-gn-ivory disabled:opacity-30 disabled:cursor-not-allowed hover:border-gn-gold"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-red-900/60 p-6 max-w-sm w-full space-y-4">
            <h3 className="font-heading text-xl font-bold uppercase text-red-400">
              REMOVE SUBSCRIBER
            </h3>
            <p className="text-xs font-mono text-zinc-300 uppercase leading-relaxed">
              REMOVE <strong>{deleteTarget.email}</strong> FROM THE GYMNATION VIP NEWSLETTER LIST?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gn-border text-xs font-mono uppercase text-zinc-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 bg-red-900/60 border border-red-800 text-white font-mono text-xs uppercase tracking-wider hover:bg-red-800 disabled:opacity-40"
              >
                {deleting ? 'REMOVING...' : 'CONFIRM REMOVE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
