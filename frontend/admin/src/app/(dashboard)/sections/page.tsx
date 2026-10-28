'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../../lib/api';

interface PageSection {
  id: string;
  pageSlug: string;
  sectionKey: string;
  title: string;
  cursiveWord?: string | null;
  body: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function SectionsPage() {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState('about-us');
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { register, handleSubmit, reset } = useForm<any>();

  const fetchSections = async (slug: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/page-sections?slug=${slug}`);
      setSections(res.data.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load page sections' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections(selectedSlug);
  }, [selectedSlug]);

  const startEdit = (sec: PageSection) => {
    setEditingSection(sec);
    reset({
      title: sec.title,
      cursiveWord: sec.cursiveWord || '',
      body: sec.body,
      ctaLabel: sec.ctaLabel || '',
      ctaHref: sec.ctaHref || '',
      isActive: sec.isActive,
    });
  };

  const onSubmit = async (data: any) => {
    if (!editingSection) return;
    try {
      await apiClient.put(`/admin/page-sections/${editingSection.id}`, {
        pageSlug: editingSection.pageSlug,
        sectionKey: editingSection.sectionKey,
        title: data.title,
        cursiveWord: data.cursiveWord || null,
        body: data.body,
        ctaLabel: data.ctaLabel || null,
        ctaHref: data.ctaHref || null,
        isActive: Boolean(data.isActive),
        sortOrder: editingSection.sortOrder,
      });
      setFeedback({ type: 'success', message: 'Page section updated' });
      setEditingSection(null);
      fetchSections(selectedSlug);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Update failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">PAGE SECTIONS & EDITORIAL</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            ABOUT US, VISION, MISSION, AND STORY EDITORIAL BLOCKS
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          {['about-us', 'why-us', 'home'].map((slug) => (
            <button
              key={slug}
              onClick={() => setSelectedSlug(slug)}
              className={`px-3 py-1.5 text-xs font-mono uppercase border transition-colors ${
                selectedSlug === slug
                  ? 'bg-gn-maroon border-gn-maroon text-white font-bold'
                  : 'bg-gn-surface border-gn-border text-gn-muted hover:text-white'
              }`}
            >
              {slug.replace('-', ' ')}
            </button>
          ))}
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

      {/* Edit Form Modal/Drawer */}
      {editingSection && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gn-surface border border-gn-border p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gn-border pb-3">
            <span className="font-heading text-xl font-bold text-gn-ivory uppercase">
              EDIT SECTION: {editingSection.sectionKey.toUpperCase()}
            </span>
            <button
              type="button"
              onClick={() => setEditingSection(null)}
              className="px-4 py-2 border border-gn-border hover:border-gn-ivory text-xs font-mono uppercase tracking-wider text-gn-muted hover:text-gn-ivory transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                SECTION TITLE
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none font-heading text-lg"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                CURSIVE ACCENT WORD
              </label>
              <input
                type="text"
                {...register('cursiveWord')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-gold focus:border-gn-maroon focus:outline-none font-serif italic text-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                BODY CONTENT (RICH EDITORIAL TEXT)
              </label>
              <textarea
                rows={4}
                {...register('body')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                CTA BUTTON LABEL
              </label>
              <input
                type="text"
                {...register('ctaLabel')}
                placeholder="JOIN NOW"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                CTA LINK HREF
              </label>
              <input
                type="text"
                {...register('ctaHref')}
                placeholder="/membership"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-gn-black border border-gn-border md:col-span-2">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4 accent-gn-maroon"
              />
              <span className="text-xs font-mono uppercase text-gn-ivory">ACTIVE SECTION ON PAGE</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gn-maroon hover:bg-gn-maroon-dark text-white font-mono text-xs uppercase tracking-wider"
            >
              SAVE SECTION
            </button>
          </div>
        </form>
      )}

      {/* Sections Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-gn-muted uppercase">
            LOADING SECTIONS FOR {selectedSlug}...
          </div>
        ) : sections.length === 0 ? (
          <div className="p-8 text-center bg-gn-surface border border-gn-border text-xs font-mono text-gn-muted">
            NO SECTIONS FOUND FOR {selectedSlug.toUpperCase()}
          </div>
        ) : (
          sections.map((sec) => (
            <div key={sec.id} className="bg-gn-surface border border-gn-border p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gn-gold uppercase tracking-widest">
                    SECTION KEY: [{sec.sectionKey}]
                  </span>
                  <h3 className="font-heading text-2xl font-bold text-gn-ivory uppercase mt-1">
                    {sec.title}{' '}
                    {sec.cursiveWord && (
                      <span className="font-serif italic font-normal text-gn-gold capitalize">
                        {sec.cursiveWord}
                      </span>
                    )}
                  </h3>
                </div>
                <button
                  onClick={() => startEdit(sec)}
                  className="px-3 py-1 bg-gn-black border border-gn-border text-xs font-mono uppercase text-gn-gold hover:border-gn-gold"
                >
                  EDIT
                </button>
              </div>
              <p className="text-xs text-gn-ivory/80 leading-relaxed mt-3 max-w-3xl">
                {sec.body}
              </p>
              {sec.ctaLabel && (
                <div className="mt-4 pt-3 border-t border-gn-border/50 text-xs font-mono text-gn-muted">
                  CTA BUTTON: <span className="text-gn-ivory font-bold">{sec.ctaLabel}</span> → <span className="text-gn-gold">{sec.ctaHref}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
