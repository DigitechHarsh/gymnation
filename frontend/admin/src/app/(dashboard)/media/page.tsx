'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';

interface MediaItem {
  id: string;
  url: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  alt?: string;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal / preview states
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [usageWarnings, setUsageWarnings] = useState<Array<{ entity: string; name: string }> | null>(null);
  const [checkingUsage, setCheckingUsage] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Manual URL upload form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newPublicId, setNewPublicId] = useState('');
  const [newAlt, setNewAlt] = useState('');

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/media?limit=50');
      setItems(res.data.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load media' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !newPublicId) return;

    try {
      setUploading(true);
      await apiClient.post('/admin/media/record', {
        url: newUrl,
        publicId: newPublicId,
        alt: newAlt,
      });
      setFeedback({ type: 'success', message: 'Media asset registered successfully' });
      setNewUrl('');
      setNewPublicId('');
      setNewAlt('');
      setShowAddForm(false);
      fetchMedia();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to record asset' });
    } finally {
      setUploading(false);
    }
  };

  const handleStartDelete = async (item: MediaItem) => {
    setDeleteTarget(item);
    setCheckingUsage(true);
    setUsageWarnings(null);
    try {
      const res = await apiClient.get(`/admin/media/check-usage/${item.id}`);
      if (res.data.data.isInUse) {
        setUsageWarnings(res.data.data.usages);
      }
    } catch {
      // Continue without warnings
    } finally {
      setCheckingUsage(false);
    }
  };

  const confirmDelete = async (force = false) => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiClient.delete(`/admin/media/${deleteTarget.id}${force ? '?force=true' : ''}`);
      setFeedback({ type: 'success', message: 'Media item deleted' });
      setDeleteTarget(null);
      setUsageWarnings(null);
      fetchMedia();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to delete' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">MEDIA LIBRARY</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            CLOUDINARY & CDN ASSET REPOSITORY
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gn-maroon hover:bg-gn-maroon-dark text-white border border-gn-maroon text-xs uppercase font-mono tracking-wider transition-colors"
        >
          {showAddForm ? 'CANCEL' : '+ REGISTER ASSET'}
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

      {/* Add Media Form */}
      {showAddForm && (
        <form onSubmit={handleCreateManual} className="bg-gn-surface border border-gn-border p-6 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-gn-gold border-b border-gn-border pb-2">
            REGISTER MEDIA ASSET
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                ASSET URL
              </label>
              <input
                type="text"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or /video.mp4"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                PUBLIC ID / IDENTIFIER
              </label>
              <input
                type="text"
                required
                value={newPublicId}
                onChange={(e) => setNewPublicId(e.target.value)}
                placeholder="gymnation/product_tub_01"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                ALT TEXT
              </label>
              <input
                type="text"
                value={newAlt}
                onChange={(e) => setNewAlt(e.target.value)}
                placeholder="GymNation Whey Protein Container"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-gn-maroon hover:bg-gn-maroon-dark text-white text-xs font-mono uppercase tracking-wider disabled:opacity-50"
            >
              {uploading ? 'REGISTERING...' : 'SAVE TO MEDIA LIBRARY'}
            </button>
          </div>
        </form>
      )}

      {/* Media Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-gn-muted uppercase">
          LOADING ASSETS FROM DATABASE...
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-gn-surface border border-gn-border">
          <div className="font-heading text-lg font-bold text-gn-ivory">NO MEDIA RECORDED YET</div>
          <p className="text-xs text-gn-muted font-mono mt-1">
            CLICK &quot;+ REGISTER ASSET&quot; TO ADD LOCAL FILES OR CLOUDINARY MEDIA
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => {
            const isVideo = item.url.endsWith('.mp4') || item.format === 'mp4';
            return (
              <div
                key={item.id}
                className="group bg-gn-surface border border-gn-border hover:border-gn-maroon transition-colors flex flex-col justify-between"
              >
                <div
                  onClick={() => setSelectedItem(item)}
                  className="aspect-square bg-gn-black relative overflow-hidden cursor-pointer flex items-center justify-center"
                >
                  {isVideo ? (
                    <div className="p-3 text-center">
                      <span className="text-[10px] font-mono text-gn-gold uppercase tracking-wider block">
                        [VIDEO REEL]
                      </span>
                      <span className="text-xs font-mono text-gn-ivory/60 truncate block mt-1">
                        {item.publicId}
                      </span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.alt || item.publicId}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>

                <div className="p-2.5 border-t border-gn-border flex flex-col justify-between">
                  <div className="text-[11px] font-mono text-gn-ivory truncate" title={item.publicId}>
                    {item.publicId}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gn-border/50">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-[10px] font-mono uppercase text-gn-gold hover:underline"
                    >
                      VIEW
                    </button>
                    <button
                      onClick={() => handleStartDelete(item)}
                      className="text-[10px] font-mono uppercase text-red-400 hover:text-red-300"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gn-border pb-3">
              <span className="font-heading text-lg font-bold text-gn-ivory uppercase">
                ASSET PREVIEW & METADATA
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-xs font-mono uppercase text-gn-muted hover:text-gn-ivory"
              >
                [CLOSE]
              </button>
            </div>

            <div className="bg-gn-black border border-gn-border max-h-96 flex items-center justify-center overflow-hidden">
              {selectedItem.url.endsWith('.mp4') ? (
                <video src={selectedItem.url} controls className="max-h-96 w-full object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedItem.url}
                  alt={selectedItem.alt || selectedItem.publicId}
                  className="max-h-96 w-full object-contain"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-gn-muted">PUBLIC ID:</span>
                <span className="text-gn-ivory ml-2">{selectedItem.publicId}</span>
              </div>
              <div>
                <span className="text-gn-muted">URL:</span>
                <a
                  href={selectedItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gn-gold ml-2 underline truncate block"
                >
                  {selectedItem.url}
                </a>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedItem.url);
                  setFeedback({ type: 'success', message: 'Asset URL copied to clipboard' });
                  setSelectedItem(null);
                }}
                className="px-4 py-2 bg-gn-black border border-gn-border text-xs uppercase font-mono text-gn-ivory hover:border-gn-gold"
              >
                COPY URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog with Usage Warnings */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border max-w-md w-full p-6 space-y-4">
            <div className="font-heading text-xl font-bold text-red-400 uppercase">
              CONFIRM ASSET DELETION
            </div>
            <p className="text-xs text-gn-ivory font-mono">
              Are you sure you want to delete <span className="text-gn-gold">{deleteTarget.publicId}</span>?
            </p>

            {checkingUsage ? (
              <div className="text-xs font-mono text-gn-muted">CHECKING SYSTEM USAGE REFERENCES...</div>
            ) : usageWarnings && usageWarnings.length > 0 ? (
              <div className="p-3 bg-red-950/40 border border-red-800 text-xs font-mono text-red-200 space-y-2">
                <div className="font-bold uppercase">[WARNING]: ASSET IS IN ACTIVE USE:</div>
                <ul className="list-disc pl-4 space-y-1">
                  {usageWarnings.map((u, i) => (
                    <li key={i}>
                      {u.entity}: {u.name}
                    </li>
                  ))}
                </ul>
                <div className="text-[10px] text-red-300 pt-1">
                  Deleting will cause broken media on the public website.
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-green-400">
                [OK]: No active references detected. Safe to remove.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gn-border">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setUsageWarnings(null);
                }}
                className="px-4 py-2 bg-gn-black border border-gn-border text-xs font-mono uppercase text-gn-ivory hover:border-gn-muted"
              >
                CANCEL
              </button>
              <button
                disabled={deleting}
                onClick={() => confirmDelete(Boolean(usageWarnings && usageWarnings.length > 0))}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-wider"
              >
                {deleting ? 'DELETING...' : usageWarnings?.length ? 'FORCE DELETE' : 'CONFIRM DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
