'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../../lib/api';

interface SettingsFormData {
  gymName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
  workingHours: string;
  gstNumber: string;
  globalOverlayOpacity: number;
  codEnabled: boolean;
  codFee: number; // In Rupees in UI
  codMaxOrderValue: number; // In Rupees in UI
  freeShippingThreshold: number; // In Rupees in UI
  flatShippingFee: number; // In Rupees in UI
  storePickupEnabled: boolean;
  storePickupAddress: string;
  marqueeEnabled: boolean;
  marqueeSpeed: number;
  marqueeBgColor: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  footerText: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<SettingsFormData>();
  const overlayOpacity = watch('globalOverlayOpacity', 0.55);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/admin/settings/admin');
        const s = res.data.data;
        reset({
          gymName: s.gymName || '',
          tagline: s.tagline || '',
          phone: s.phone || '',
          whatsapp: s.whatsapp || '',
          email: s.email || '',
          address: s.address || '',
          mapEmbedUrl: s.mapEmbedUrl || '',
          workingHours: s.workingHours || '',
          gstNumber: s.gstNumber || '',
          globalOverlayOpacity: s.globalOverlayOpacity ?? 0.55,
          codEnabled: s.codEnabled ?? true,
          codFee: (s.codFee || 0) / 100,
          codMaxOrderValue: (s.codMaxOrderValue || 0) / 100,
          freeShippingThreshold: (s.freeShippingThreshold || 0) / 100,
          flatShippingFee: (s.flatShippingFee || 0) / 100,
          storePickupEnabled: s.storePickupEnabled ?? true,
          storePickupAddress: s.storePickupAddress || '',
          marqueeEnabled: s.marqueeEnabled ?? true,
          marqueeSpeed: s.marqueeSpeed || 30,
          marqueeBgColor: s.marqueeBgColor || '#7A1F25',
          defaultSeoTitle: s.defaultSeoTitle || '',
          defaultSeoDescription: s.defaultSeoDescription || '',
          footerText: s.footerText || '',
        });
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message || 'Failed to load site settings' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setSaving(true);
      setFeedback(null);

      // Convert INR Rupee inputs to paise for server storage
      const payload = {
        ...data,
        codFee: Math.round(Number(data.codFee) * 100),
        codMaxOrderValue: Math.round(Number(data.codMaxOrderValue) * 100),
        freeShippingThreshold: Math.round(Number(data.freeShippingThreshold) * 100),
        flatShippingFee: Math.round(Number(data.flatShippingFee) * 100),
        globalOverlayOpacity: Number(data.globalOverlayOpacity),
        marqueeSpeed: Number(data.marqueeSpeed),
      };

      await apiClient.put('/admin/settings/admin', payload);
      setFeedback({ type: 'success', message: 'Site settings updated successfully' });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save settings',
      });
    } finally {
      setSaving(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'AUDIT_LOGS'>('SETTINGS');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditEntity, setAuditEntity] = useState('');

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const params: any = { limit: 25 };
      if (auditSearch.trim()) params.search = auditSearch.trim();
      if (auditEntity) params.entity = auditEntity;
      const res = await apiClient.get('/admin/audit-logs', { params });
      if (res.data?.success) {
        setAuditLogs(res.data.data.logs || []);
      }
    } catch {
      // Continue
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'audit') {
        setActiveTab('AUDIT_LOGS');
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'AUDIT_LOGS') {
      fetchAuditLogs();
    }
  }, [activeTab, auditEntity]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-gn-muted uppercase">
        LOADING SITE SETTINGS...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">SYSTEM & SETTINGS</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            GLOBAL CONFIGURATION & AUDIT TRAIL CONTROL
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border border-gn-border bg-gn-black p-1">
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
              activeTab === 'SETTINGS'
                ? 'bg-gn-maroon text-white font-bold border border-gn-gold/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Site & Store Settings
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-gn-maroon text-white font-bold border border-gn-gold/50'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Admin Audit Activity
          </button>
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

      {activeTab === 'AUDIT_LOGS' ? (
        /* Tab 2: Admin Audit Activity Pane */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 bg-gn-surface p-4 border border-gn-border items-center justify-between">
            <div className="flex-1 w-full sm:w-auto flex gap-2">
              <input
                type="text"
                placeholder="Search audit trail by admin, action, or entity..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAuditLogs()}
                className="flex-1 bg-gn-black border border-gn-border px-3 py-2 text-xs font-mono uppercase text-gn-ivory placeholder-zinc-600 focus:outline-none focus:border-gn-gold"
              />
              <button
                onClick={fetchAuditLogs}
                className="px-4 py-2 bg-gn-maroon text-white text-xs font-mono uppercase font-bold"
              >
                FILTER
              </button>
            </div>

            <select
              value={auditEntity}
              onChange={(e) => setAuditEntity(e.target.value)}
              className="bg-gn-black border border-gn-border px-3 py-2 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
            >
              <option value="">ALL ENTITIES</option>
              <option value="Product">PRODUCT</option>
              <option value="Order">ORDER</option>
              <option value="Category">CATEGORY</option>
              <option value="Coupon">COUPON</option>
              <option value="SiteSetting">SITE SETTING</option>
              <option value="Membership">MEMBERSHIP</option>
            </select>
          </div>

          {auditLoading ? (
            <div className="p-8 text-center text-xs font-mono text-zinc-500">
              SYNCHRONIZING AUDIT TRAIL...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-12 text-center bg-gn-surface border border-gn-border space-y-2">
              <div className="font-heading text-lg font-bold uppercase text-white">
                NO AUDIT LOGS FOUND
              </div>
              <p className="text-xs font-mono text-zinc-400">
                Staff mutations and system updates will be logged here automatically.
              </p>
            </div>
          ) : (
            <div className="bg-gn-surface border border-gn-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-gn-black border-b border-gn-border text-zinc-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">TIMESTAMP</th>
                      <th className="p-3.5">ADMIN USER</th>
                      <th className="p-3.5">ACTION</th>
                      <th className="p-3.5">ENTITY</th>
                      <th className="p-3.5">DETAILS / IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gn-border text-gn-ivory">
                    {auditLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-gn-black/30 transition-colors">
                        <td className="p-3.5 text-zinc-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-3.5 font-bold">
                          {log.adminUser?.name || 'System Operator'}
                          <div className="text-[10px] text-zinc-500 font-normal">
                            {log.adminUser?.email || 'automated'}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 border border-gn-border bg-gn-black text-gn-gold text-[10px] uppercase font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 text-zinc-300 uppercase">
                          {log.entity} {log.entityId ? `#${log.entityId.slice(-6)}` : ''}
                        </td>
                        <td className="p-3.5 text-zinc-400 text-[11px]">
                          {log.ip && <span className="text-zinc-500">IP: {log.ip} &bull; </span>}
                          {log.diff ? JSON.stringify(log.diff).slice(0, 60) : 'Standard mutation'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Tab 1: Settings Form */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Gym & Contact Information */}
        <div className="bg-gn-surface border border-gn-border p-6 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-gn-gold border-b border-gn-border pb-2">
            01. GYM IDENTITY & LOCATION
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                GYM NAME
              </label>
              <input
                type="text"
                {...register('gymName')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                TAGLINE
              </label>
              <input
                type="text"
                {...register('tagline')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                PHONE NUMBER
              </label>
              <input
                type="text"
                {...register('phone')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                WHATSAPP NUMBER
              </label>
              <input
                type="text"
                {...register('whatsapp')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                PRIMARY EMAIL
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                SELLER GSTIN
              </label>
              <input
                type="text"
                {...register('gstNumber')}
                placeholder="24AAAAA0000A1Z5"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                GYM ADDRESS (SURAT, GUJARAT)
              </label>
              <input
                type="text"
                {...register('address')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                WORKING HOURS & TIMINGS
              </label>
              <input
                type="text"
                {...register('workingHours')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                GOOGLE MAP EMBED URL
              </label>
              <input
                type="text"
                {...register('mapEmbedUrl')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* E-Commerce Shipping & Payment Rules */}
        <div className="bg-gn-surface border border-gn-border p-6 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-gn-gold border-b border-gn-border pb-2">
            02. SHIPPING & PAYMENT POLICIES
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                FREE SHIPPING THRESHOLD (₹)
              </label>
              <input
                type="number"
                step="1"
                {...register('freeShippingThreshold')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
              <span className="text-[10px] text-gn-muted font-mono">
                Orders equal or above this amount receive free shipping (e.g. ₹999).
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                FLAT SHIPPING FEE (₹)
              </label>
              <input
                type="number"
                step="1"
                {...register('flatShippingFee')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
              <span className="text-[10px] text-gn-muted font-mono">
                Applied when order value is below free shipping threshold.
              </span>
            </div>

            <div className="space-y-2 p-3 bg-gn-black border border-gn-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-gn-ivory">
                  CASH ON DELIVERY (COD)
                </span>
                <input
                  type="checkbox"
                  {...register('codEnabled')}
                  className="w-4 h-4 accent-gn-maroon"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-[10px] font-mono text-gn-muted">COD EXTRA FEE (₹)</label>
                  <input
                    type="number"
                    step="1"
                    {...register('codFee')}
                    className="w-full bg-gn-surface border border-gn-border px-2 py-1 text-xs text-gn-ivory"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gn-muted">MAX COD LIMIT (₹)</label>
                  <input
                    type="number"
                    step="100"
                    {...register('codMaxOrderValue')}
                    className="w-full bg-gn-surface border border-gn-border px-2 py-1 text-xs text-gn-ivory"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-gn-black border border-gn-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-gn-ivory">
                  STORE PICKUP IN SURAT (FREE)
                </span>
                <input
                  type="checkbox"
                  {...register('storePickupEnabled')}
                  className="w-4 h-4 accent-gn-maroon"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-gn-muted">PICKUP ADDRESS</label>
                <input
                  type="text"
                  {...register('storePickupAddress')}
                  className="w-full bg-gn-surface border border-gn-border px-2 py-1 text-xs text-gn-ivory"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Hero Overlay & Marquee Bar */}
        <div className="bg-gn-surface border border-gn-border p-6 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-gn-gold border-b border-gn-border pb-2">
            03. VISUAL OVERLAY & OFFER MARQUEE
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gn-black border border-gn-border">
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                DEFAULT OVERLAY OPACITY: {Math.round(overlayOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                {...register('globalOverlayOpacity')}
                className="w-full accent-gn-maroon mt-2 cursor-pointer"
              />
              <span className="text-[10px] text-gn-muted font-mono block mt-1">
                Controls the dark tint overlay over the background video and images.
              </span>
            </div>

            <div className="p-3 bg-gn-black border border-gn-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-gn-ivory">
                  ENABLE TOP OFFER MARQUEE
                </span>
                <input
                  type="checkbox"
                  {...register('marqueeEnabled')}
                  className="w-4 h-4 accent-gn-maroon"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-[10px] font-mono text-gn-muted">SCROLL SPEED (SEC)</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    {...register('marqueeSpeed')}
                    className="w-full bg-gn-surface border border-gn-border px-2 py-1 text-xs text-gn-ivory"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gn-muted">BACKGROUND COLOR</label>
                  <input
                    type="text"
                    {...register('marqueeBgColor')}
                    className="w-full bg-gn-surface border border-gn-border px-2 py-1 text-xs text-gn-ivory font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global SEO & Footer */}
        <div className="bg-gn-surface border border-gn-border p-6 space-y-4">
          <div className="text-xs font-mono uppercase tracking-widest text-gn-gold border-b border-gn-border pb-2">
            04. DEFAULT SEO & FOOTER
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                DEFAULT PAGE TITLE TAG
              </label>
              <input
                type="text"
                {...register('defaultSeoTitle')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                DEFAULT META DESCRIPTION
              </label>
              <textarea
                rows={3}
                {...register('defaultSeoDescription')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                FOOTER COPYRIGHT TEXT
              </label>
              <input
                type="text"
                {...register('footerText')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gn-maroon hover:bg-gn-maroon-dark text-white font-heading font-bold text-base tracking-wider uppercase border border-gn-maroon transition-colors disabled:opacity-50"
          >
            {saving ? 'SAVING SETTINGS...' : 'SAVE SITE SETTINGS'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
