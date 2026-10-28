'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../../lib/api';

interface HeroSlide {
  id: string;
  eyebrow: string;
  heading: string;
  cursiveWord: string;
  subText: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  rightImage?: { url: string; publicId: string; alt?: string } | null;
  bgType: 'VIDEO' | 'IMAGE';
  bgMedia?: { url: string; publicId: string } | null;
  overlayOpacity: number;
  offerBadgeText?: string | null;
  offerBadgeSubtext?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<any>({
    defaultValues: {
      eyebrow: "SURAT'S FITNESS HUB",
      heading: 'DISCIPLINE BUILDS',
      cursiveWord: 'Freedom',
      subText: 'Stronger people. A stronger tomorrow.',
      ctaPrimaryLabel: 'SHOP NOW',
      ctaPrimaryHref: '/products',
      ctaSecondaryLabel: 'JOIN MEMBERSHIP',
      ctaSecondaryHref: '/membership',
      rightImageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000',
      bgType: 'VIDEO',
      bgMediaUrl: '/video.mp4',
      overlayOpacity: 0.55,
      offerBadgeText: 'FLAT 30% OFF',
      offerBadgeSubtext: 'ON ALL SUPPLEMENTS',
      isActive: true,
      sortOrder: 1,
    },
  });

  // Watch values for LIVE PREVIEW
  const liveEyebrow = watch('eyebrow');
  const liveHeading = watch('heading');
  const liveCursiveWord = watch('cursiveWord');
  const liveSubText = watch('subText');
  const liveCtaPrimary = watch('ctaPrimaryLabel');
  const liveCtaSecondary = watch('ctaSecondaryLabel');
  const liveRightImage = watch('rightImageUrl');
  const liveBgType = watch('bgType');
  const liveBgMedia = watch('bgMediaUrl');
  const liveOverlay = watch('overlayOpacity');
  const liveBadgeText = watch('offerBadgeText');
  const liveBadgeSubtext = watch('offerBadgeSubtext');

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/hero-slides');
      setSlides(res.data.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch hero slides' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const startEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setIsCreating(false);
    reset({
      eyebrow: slide.eyebrow,
      heading: slide.heading,
      cursiveWord: slide.cursiveWord,
      subText: slide.subText,
      ctaPrimaryLabel: slide.ctaPrimaryLabel,
      ctaPrimaryHref: slide.ctaPrimaryHref,
      ctaSecondaryLabel: slide.ctaSecondaryLabel,
      ctaSecondaryHref: slide.ctaSecondaryHref,
      rightImageUrl: slide.rightImage?.url || '',
      bgType: slide.bgType,
      bgMediaUrl: slide.bgMedia?.url || '',
      overlayOpacity: slide.overlayOpacity,
      offerBadgeText: slide.offerBadgeText || '',
      offerBadgeSubtext: slide.offerBadgeSubtext || '',
      isActive: slide.isActive,
      sortOrder: slide.sortOrder,
    });
  };

  const startCreate = () => {
    setEditingSlide(null);
    setIsCreating(true);
    reset({
      eyebrow: "SURAT'S FITNESS HUB",
      heading: 'FORGE YOUR',
      cursiveWord: 'Legacy',
      subText: 'Train with international-standard barbells, racks and certified coaches.',
      ctaPrimaryLabel: 'EXPLORE PLANS',
      ctaPrimaryHref: '/membership',
      ctaSecondaryLabel: 'VISIT GYM',
      ctaSecondaryHref: '/contact',
      rightImageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000',
      bgType: 'IMAGE',
      bgMediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600',
      overlayOpacity: 0.55,
      offerBadgeText: 'NEW MEMBER PASS',
      offerBadgeSubtext: 'EXPERIENCE THE FLOOR',
      isActive: true,
      sortOrder: slides.length + 1,
    });
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        eyebrow: data.eyebrow,
        heading: data.heading,
        cursiveWord: data.cursiveWord,
        subText: data.subText,
        ctaPrimaryLabel: data.ctaPrimaryLabel,
        ctaPrimaryHref: data.ctaPrimaryHref,
        ctaSecondaryLabel: data.ctaSecondaryLabel,
        ctaSecondaryHref: data.ctaSecondaryHref,
        rightImage: data.rightImageUrl
          ? { url: data.rightImageUrl, publicId: 'hero_right_' + Date.now(), alt: data.heading }
          : null,
        bgType: data.bgType,
        bgMedia: data.bgMediaUrl
          ? { url: data.bgMediaUrl, publicId: 'hero_bg_' + Date.now() }
          : null,
        overlayOpacity: Number(data.overlayOpacity),
        offerBadgeText: data.offerBadgeText || null,
        offerBadgeSubtext: data.offerBadgeSubtext || null,
        isActive: Boolean(data.isActive),
        sortOrder: Number(data.sortOrder) || 1,
      };

      if (editingSlide) {
        await apiClient.put(`/admin/hero-slides/${editingSlide.id}`, payload);
        setFeedback({ type: 'success', message: 'Hero slide updated successfully' });
      } else {
        await apiClient.post('/admin/hero-slides', payload);
        setFeedback({ type: 'success', message: 'Hero slide created successfully' });
      }

      setEditingSlide(null);
      setIsCreating(false);
      fetchSlides();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Operation failed' });
    }
  };

  const handleMove = async (index: number, direction: 'UP' | 'DOWN') => {
    const newSlides = [...slides];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    setSlides(newSlides);
    try {
      await apiClient.patch('/admin/hero-slides/reorder', {
        ids: newSlides.map((s) => s.id),
      });
      setFeedback({ type: 'success', message: 'Slide sequence updated' });
    } catch {
      fetchSlides();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/admin/hero-slides/${deleteTarget.id}`);
      setFeedback({ type: 'success', message: 'Slide deleted' });
      setDeleteTarget(null);
      fetchSlides();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">HERO SLIDER MANAGEMENT</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            FULL-SCREEN CINEMATIC HERO WITH LIVE WEBSITE PREVIEW
          </p>
        </div>
        {!editingSlide && !isCreating && (
          <button
            onClick={startCreate}
            className="mt-4 sm:mt-0 px-4 py-2 bg-gn-maroon hover:bg-gn-maroon-dark text-white border border-gn-maroon text-xs uppercase font-mono tracking-wider transition-colors"
          >
            + ADD HERO SLIDE
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

      {/* Editor & Live Preview Panel */}
      {(editingSlide || isCreating) && (
        <div className="space-y-6 bg-gn-surface border border-gn-border p-6">
          <div className="flex items-center justify-between border-b border-gn-border pb-3">
            <span className="font-heading text-xl font-bold text-gn-ivory uppercase">
              {editingSlide ? `EDIT SLIDE: ${editingSlide.heading}` : 'CREATE NEW HERO SLIDE'}
            </span>
            <button
              type="button"
              onClick={() => {
                setEditingSlide(null);
                setIsCreating(false);
              }}
              className="px-4 py-2 border border-gn-border hover:border-gn-ivory text-xs font-mono uppercase tracking-wider text-gn-muted hover:text-gn-ivory transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* LIVE PREVIEW COMPONENT */}
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-gn-gold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-gn-gold inline-block" />
              <span>LIVE WEBSITE HERO PREVIEW (MIMICS WEBSITE INTERFACE)</span>
            </div>
            <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] bg-gn-black border border-gn-border overflow-hidden">
              {/* Background Media */}
              {liveBgType === 'VIDEO' ? (
                <video
                  src={liveBgMedia || '/video.mp4'}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={liveBgMedia || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600'}
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Dynamic Overlay Opacity Tint */}
              <div
                className="absolute inset-0 bg-black transition-opacity duration-150"
                style={{ opacity: Number(liveOverlay) }}
              />

              {/* Hero Content Overlay */}
              <div className="relative z-10 h-full w-full p-6 sm:p-10 flex items-center justify-between">
                {/* Left Text */}
                <div className="max-w-xl space-y-3">
                  <div className="text-[10px] sm:text-xs font-mono tracking-widest uppercase text-gn-gold">
                    {liveEyebrow}
                  </div>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gn-ivory leading-none">
                    {liveHeading}{' '}
                    <span className="font-serif italic font-normal text-gn-gold capitalize">
                      {liveCursiveWord}
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-gn-ivory/80 leading-relaxed font-sans max-w-md">
                    {liveSubText}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="px-4 py-2 bg-gn-maroon text-white font-heading font-bold text-xs uppercase tracking-wider">
                      {liveCtaPrimary || 'ACTION'}
                    </span>
                    <span className="px-4 py-2 bg-transparent border border-gn-ivory/60 text-gn-ivory font-heading font-bold text-xs uppercase tracking-wider">
                      {liveCtaSecondary || 'LEARN MORE'}
                    </span>
                  </div>
                </div>

                {/* Right Image Cutout & Offer Badge */}
                <div className="relative hidden md:block w-72 h-full">
                  {liveRightImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={liveRightImage}
                      alt="Hero Athlete"
                      className="absolute bottom-0 right-0 max-h-full object-contain"
                    />
                  )}
                  {liveBadgeText && (
                    <div className="absolute top-4 right-0 p-3 bg-gn-surface/95 border-2 border-gn-gold shadow-xl text-center">
                      <div className="font-heading text-lg font-bold text-gn-gold leading-none">
                        {liveBadgeText}
                      </div>
                      {liveBadgeSubtext && (
                        <div className="text-[9px] font-mono uppercase tracking-wider text-gn-ivory mt-0.5">
                          {liveBadgeSubtext}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4 border-t border-gn-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  EYEBROW TEXT
                </label>
                <input
                  type="text"
                  {...register('eyebrow')}
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  PRIMARY HEADING
                </label>
                <input
                  type="text"
                  {...register('heading')}
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none font-heading text-base"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  CURSIVE ACCENT WORD
                </label>
                <input
                  type="text"
                  {...register('cursiveWord')}
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-gold focus:border-gn-maroon focus:outline-none font-serif italic text-base"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  SUBTEXT / DESCRIPTION
                </label>
                <input
                  type="text"
                  {...register('subText')}
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  PRIMARY CTA LABEL
                </label>
                <input
                  type="text"
                  {...register('ctaPrimaryLabel')}
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  PRIMARY CTA LINK HREF
                </label>
                <input
                  type="text"
                  {...register('ctaPrimaryHref')}
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  RIGHT ATHLETE IMAGE URL
                </label>
                <input
                  type="text"
                  {...register('rightImageUrl')}
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  SECONDARY CTA LABEL
                </label>
                <input
                  type="text"
                  {...register('ctaSecondaryLabel')}
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  SECONDARY CTA LINK HREF
                </label>
                <input
                  type="text"
                  {...register('ctaSecondaryHref')}
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  BACKGROUND TYPE
                </label>
                <select
                  {...register('bgType')}
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none uppercase font-mono"
                >
                  <option value="VIDEO">VIDEO (MP4)</option>
                  <option value="IMAGE">IMAGE (HIGH RES)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  BACKGROUND MEDIA URL
                </label>
                <input
                  type="text"
                  {...register('bgMediaUrl')}
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  OVERLAY OPACITY: {Math.round(Number(liveOverlay) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  {...register('overlayOpacity')}
                  className="w-full accent-gn-maroon mt-2 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  OFFER BADGE MAIN TEXT
                </label>
                <input
                  type="text"
                  {...register('offerBadgeText')}
                  placeholder="FLAT 30% OFF"
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-gold focus:border-gn-maroon focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                  OFFER BADGE SUBTEXT
                </label>
                <input
                  type="text"
                  {...register('offerBadgeSubtext')}
                  placeholder="ON ALL SUPPLEMENTS"
                  className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 p-3 bg-gn-black border border-gn-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="w-4 h-4 accent-gn-maroon"
                  />
                  <span className="text-xs font-mono uppercase text-gn-ivory">ACTIVE SLIDE</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gn-border">
              <button
                type="button"
                onClick={() => {
                  setEditingSlide(null);
                  setIsCreating(false);
                }}
                className="px-6 py-2.5 bg-gn-black border border-gn-border text-xs font-mono uppercase text-gn-ivory"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-gn-maroon hover:bg-gn-maroon-dark text-white font-heading font-bold text-sm tracking-wider uppercase border border-gn-maroon transition-colors"
              >
                SAVE HERO SLIDE
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hero Slides Table & Order */}
      <div className="bg-gn-surface border border-gn-border overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-gn-border bg-gn-black/80 text-gn-muted uppercase tracking-wider">
              <th className="p-3.5 w-16">ORDER</th>
              <th className="p-3.5">HEADING & ACCENT</th>
              <th className="p-3.5">BG TYPE</th>
              <th className="p-3.5">OFFER BADGE</th>
              <th className="p-3.5">STATUS</th>
              <th className="p-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gn-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gn-muted uppercase">
                  LOADING HERO SLIDES...
                </td>
              </tr>
            ) : (
              slides.map((s, index) => (
                <tr key={s.id} className="hover:bg-gn-surface-light/40 transition-colors">
                  <td className="p-3.5 text-gn-gold font-bold">
                    <div className="flex items-center gap-1">
                      <span>#{s.sortOrder}</span>
                      <div className="flex flex-col ml-1">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMove(index, 'UP')}
                          className="text-[9px] hover:text-white disabled:opacity-20"
                        >
                          ▲
                        </button>
                        <button
                          disabled={index === slides.length - 1}
                          onClick={() => handleMove(index, 'DOWN')}
                          className="text-[9px] hover:text-white disabled:opacity-20"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-gn-ivory font-bold font-heading text-sm uppercase">
                      {s.heading}{' '}
                      <span className="font-serif italic font-normal text-gn-gold capitalize text-xs">
                        {s.cursiveWord}
                      </span>
                    </div>
                    <div className="text-[10px] text-gn-muted truncate max-w-xs">{s.subText}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-gn-black border border-gn-border text-gn-ivory uppercase">
                      {s.bgType} ({Math.round(s.overlayOpacity * 100)}%)
                    </span>
                  </td>
                  <td className="p-3.5 text-gn-gold">
                    {s.offerBadgeText ? (
                      <span className="px-2 py-0.5 text-[10px] bg-gn-gold/10 border border-gn-gold/30 text-gn-gold font-bold uppercase">
                        {s.offerBadgeText}
                      </span>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {s.isActive ? (
                      <span className="px-2 py-0.5 text-[10px] bg-green-950/60 border border-green-800 text-green-400 font-bold uppercase">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-500 font-bold uppercase">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="px-2.5 py-1 bg-gn-black hover:bg-gn-surface border border-gn-border hover:border-gn-gold text-gn-gold text-xs uppercase transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="px-2.5 py-1 bg-gn-black hover:bg-red-950/60 border border-gn-border hover:border-red-700 text-red-400 text-xs uppercase transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border max-w-sm w-full p-6 space-y-4">
            <div className="font-heading text-xl font-bold text-red-400 uppercase">
              CONFIRM SLIDE DELETION
            </div>
            <p className="text-xs text-gn-ivory font-mono">
              Are you sure you want to delete slide &quot;{deleteTarget.heading} {deleteTarget.cursiveWord}&quot;?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gn-border">
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
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-wider"
              >
                Delete Slide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
