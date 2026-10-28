'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';

interface MembershipItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  source: 'ONLINE' | 'WALK_IN';
  paymentId?: string | null;
  remainingDays: number;
  isExpiringSoon: boolean;
  plan: {
    id: string;
    name: string;
    price: number;
    durationDays: number;
  };
}

interface PlanOption {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

const STATUS_TABS = [
  { label: 'ALL MEMBERS', value: 'ALL' },
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'ONLINE JOINED', value: 'ONLINE' },
  { label: 'WALK-IN DESK', value: 'WALK_IN' },
  { label: 'EXPIRING IN 7 DAYS', value: 'EXPIRING_SOON' },
  { label: 'EXPIRED', value: 'EXPIRED' },
];

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<MembershipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Available plans for dropdown
  const [plans, setPlans] = useState<PlanOption[]>([]);

  // Digital Card modal target
  const [cardTarget, setCardTarget] = useState<MembershipItem | null>(null);

  // Walk-in modal
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInPlanId, setWalkInPlanId] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInDurationDays, setWalkInDurationDays] = useState('30');
  const [walkInNotes, setWalkInNotes] = useState('');
  const [savingWalkIn, setSavingWalkIn] = useState(false);

  // Extend modal
  const [extendTarget, setExtendTarget] = useState<MembershipItem | null>(null);
  const [additionalDays, setAdditionalDays] = useState('30');
  const [extendReason, setExtendReason] = useState('Standard renewal payment at front desk');
  const [extending, setExtending] = useState(false);

  // Cancel modal
  const [cancelTarget, setCancelTarget] = useState<MembershipItem | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPlans = async () => {
    try {
      const res = await apiClient.get('/membership-plans');
      if (res.data?.success) {
        setPlans(res.data.data);
        if (res.data.data.length > 0 && !walkInPlanId) {
          setWalkInPlanId(res.data.data[0].id);
        }
      }
    } catch {
      // ignore
    }
  };

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (statusFilter === 'EXPIRING_SOON') {
        params.filter = 'EXPIRING_SOON';
      } else if (statusFilter === 'WALK_IN') {
        params.source = 'WALK_IN';
      } else if (statusFilter === 'ONLINE') {
        params.source = 'ONLINE';
      } else if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      if (search.trim()) params.search = search.trim();

      const res = await apiClient.get('/admin/memberships', { params });
      if (res.data?.success) {
        setMemberships(res.data.data.memberships);
        setStatusCounts(res.data.data.statusCounts || {});
        setTotalPages(res.data.data.totalPages || 1);
        setTotalCount(res.data.data.total || 0);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load memberships' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchMemberships();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMemberships();
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInPlanId || !walkInName || !walkInPhone) return;

    try {
      setSavingWalkIn(true);
      const res = await apiClient.post('/admin/memberships/walk-in', {
        planId: walkInPlanId,
        name: walkInName.trim(),
        phone: walkInPhone.trim(),
        email: walkInEmail.trim() || `${walkInPhone.trim()}@walkin.gymnation.in`,
        customDurationDays: parseInt(walkInDurationDays, 10) || 30,
        notes: walkInNotes.trim(),
      });

      if (res.data?.success) {
        setFeedback({ type: 'success', message: res.data.message });
        setShowWalkInModal(false);
        setWalkInName('');
        setWalkInPhone('');
        setWalkInEmail('');
        setWalkInNotes('');
        fetchMemberships();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create walk-in member' });
    } finally {
      setSavingWalkIn(false);
    }
  };

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendTarget) return;

    try {
      setExtending(true);
      const res = await apiClient.patch(`/admin/memberships/${extendTarget.id}/extend`, {
        additionalDays: parseInt(additionalDays, 10),
        reason: extendReason.trim(),
      });

      if (res.data?.success) {
        setFeedback({ type: 'success', message: res.data.message });
        setExtendTarget(null);
        fetchMemberships();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to extend membership' });
    } finally {
      setExtending(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;

    try {
      setCancelling(true);
      const res = await apiClient.patch(`/admin/memberships/${cancelTarget.id}/cancel`);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: 'Membership cancelled' });
        setCancelTarget(null);
        fetchMemberships();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to cancel membership' });
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-950/60 text-green-400 border-green-800';
      case 'EXPIRED':
        return 'bg-red-950/60 text-red-400 border-red-800';
      case 'CANCELLED':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gn-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl font-extrabold tracking-wider uppercase text-gn-ivory">
              MEMBERSHIP DESK
            </h1>
            <span className="text-xs font-mono uppercase bg-gn-maroon/30 text-gn-ivory px-2.5 py-1 border border-gn-maroon/60">
              {totalCount} TOTAL ENROLLED
            </span>
          </div>
          <p className="text-xs text-gn-muted font-mono uppercase tracking-widest mt-1">
            ATHLETE ROSTER, EXPIRING PASSES, AND WALK-IN RECEPTION REGISTRATION
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWalkInModal(true)}
            className="px-5 py-2 bg-gn-maroon hover:bg-gn-maroon/80 text-gn-ivory font-heading font-bold text-sm tracking-wider uppercase transition-colors"
          >
            + ADD WALK-IN MEMBER
          </button>
          <button
            onClick={() => fetchMemberships()}
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

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gn-border overflow-x-auto pb-px">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          const count = statusCounts[tab.value] ?? (tab.value === 'ALL' ? statusCounts.ALL || 0 : 0);
          return (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2.5 text-xs uppercase font-mono tracking-wider transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'border-gn-gold text-gn-gold font-bold bg-gn-surface/50'
                  : 'border-transparent text-gn-muted hover:text-gn-ivory hover:border-gn-border'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 border ${
                isActive ? 'border-gn-gold/60 text-gn-gold' : 'border-gn-border text-gn-muted'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-gn-surface p-4 border border-gn-border">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="SEARCH ATHLETE BY NAME, PHONE, OR EMAIL..."
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
                fetchMemberships();
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
        <table className="w-full min-w-[720px] text-left border-collapse">
          <thead>
            <tr className="border-b border-gn-border bg-gn-black/60 text-[11px] font-mono uppercase tracking-widest text-gn-muted">
              <th className="p-4">ATHLETE / MEMBER</th>
              <th className="p-4">MEMBERSHIP PLAN</th>
              <th className="p-4 text-center">SOURCE</th>
              <th className="p-4">VALIDITY WINDOW</th>
              <th className="p-4 text-center">TIME REMAINING</th>
              <th className="p-4 text-center">STATUS</th>
              <th className="p-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gn-border text-xs">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gn-muted font-mono uppercase tracking-widest">
                  FETCHING MEMBERSHIP DATA...
                </td>
              </tr>
            ) : memberships.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gn-muted font-mono uppercase tracking-widest">
                  NO MEMBERS FOUND MATCHING CURRENT FILTERS.
                </td>
              </tr>
            ) : (
              memberships.map((m) => {
                const startDateStr = new Date(m.startDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                const endDateStr = new Date(m.endDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={m.id} className="hover:bg-gn-black/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gn-ivory uppercase tracking-wider">{m.name}</div>
                      <div className="text-[11px] font-mono text-gn-gold mt-0.5">{m.phone}</div>
                      {m.email && <div className="text-[10px] font-mono text-zinc-400 mt-0.5">{m.email}</div>}
                    </td>

                    <td className="p-4">
                      <div className="font-heading font-extrabold text-sm text-gn-ivory uppercase">
                        {m.plan?.name || 'CUSTOM PASS'}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        ₹{m.plan?.price ? (m.plan.price / 100).toLocaleString('en-IN') : '0'} / {m.plan?.durationDays || 30} DAYS
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${
                        m.source === 'WALK_IN'
                          ? 'border-amber-800 text-amber-300 bg-amber-950/40'
                          : 'border-blue-800 text-blue-300 bg-blue-950/40'
                      }`}>
                        {m.source === 'WALK_IN' ? 'WALK-IN (FRONT DESK)' : 'ONLINE'}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-zinc-300 text-[11px] whitespace-nowrap">
                      <div>FROM: {startDateStr}</div>
                      <div className="text-zinc-400 mt-0.5">TILL: {endDateStr}</div>
                    </td>

                    <td className="p-4 text-center">
                      {m.status === 'EXPIRED' ? (
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-red-800 text-red-400 bg-red-950/30">
                          EXPIRED
                        </span>
                      ) : m.isExpiringSoon ? (
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-gn-gold text-gn-gold bg-gn-gold/10 animate-pulse">
                          {m.remainingDays} DAYS LEFT
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-green-800 text-green-400 bg-green-950/30">
                          {m.remainingDays} DAYS LEFT
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border ${getStatusBadge(m.status)}`}>
                        {m.status}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setCardTarget(m)}
                          className="px-2.5 py-1.5 bg-gn-gold/15 border border-gn-gold/60 text-[11px] font-mono uppercase tracking-wider text-gn-gold hover:bg-gn-gold hover:text-black transition-colors font-bold"
                          title="View Digital Membership Card & Print"
                        >
                          CARD / PASS
                        </button>
                        <button
                          onClick={() => setExtendTarget(m)}
                          className="px-3 py-1.5 bg-gn-black border border-gn-border text-[11px] font-mono uppercase tracking-wider text-gn-ivory hover:border-gn-gold hover:text-gn-gold transition-colors"
                        >
                          EXTEND
                        </button>
                        {m.status === 'ACTIVE' && (
                          <button
                            onClick={() => setCancelTarget(m)}
                            className="px-2.5 py-1.5 bg-gn-black border border-red-900/60 text-[11px] font-mono uppercase tracking-wider text-red-400 hover:border-red-600 transition-colors"
                          >
                            CANCEL
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gn-border flex items-center justify-between bg-gn-black/40">
            <span className="text-xs font-mono uppercase text-gn-muted">
              PAGE {page} OF {totalPages} ({totalCount} MEMBERS TOTAL)
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

      {/* MODAL 1: ADD WALK-IN MEMBER */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-gn-border pb-3">
              <h3 className="font-heading text-xl font-bold uppercase text-gn-ivory">
                REGISTER WALK-IN ATHLETE
              </h3>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-xs uppercase"
              >
                CLOSE
              </button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  SELECT MEMBERSHIP PLAN *
                </label>
                <select
                  value={walkInPlanId}
                  onChange={(e) => {
                    setWalkInPlanId(e.target.value);
                    const selected = plans.find((p) => p.id === e.target.value);
                    if (selected) setWalkInDurationDays(selected.durationDays.toString());
                  }}
                  className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
                  required
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ₹{(p.price / 100).toLocaleString('en-IN')} ({p.durationDays} DAYS)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    placeholder="E.G. SURESH DESAI"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                    PHONE NUMBER (10 DIGITS) *
                  </label>
                  <input
                    type="tel"
                    placeholder="9825012345"
                    pattern="[6-9][0-9]{9}"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono text-gn-ivory focus:outline-none focus:border-gn-gold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    placeholder="athlete@gmail.com"
                    value={walkInEmail}
                    onChange={(e) => setWalkInEmail(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono text-gn-ivory focus:outline-none focus:border-gn-gold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                    VALIDITY DURATION (DAYS)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={walkInDurationDays}
                    onChange={(e) => setWalkInDurationDays(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono text-gn-ivory focus:outline-none focus:border-gn-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  STAFF RECEPTION NOTES
                </label>
                <input
                  type="text"
                  placeholder="E.G. PAID VIA CASH AT DESK, ASSIGNED LOCKER #14"
                  value={walkInNotes}
                  onChange={(e) => setWalkInNotes(e.target.value)}
                  className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gn-border">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 border border-gn-border text-xs font-mono uppercase text-zinc-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={savingWalkIn}
                  className="px-5 py-2 bg-gn-maroon text-gn-ivory font-heading font-bold text-sm uppercase tracking-wider hover:bg-gn-maroon/80 disabled:opacity-40"
                >
                  {savingWalkIn ? 'REGISTERING...' : 'ENROLL ATHLETE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EXTEND MEMBERSHIP */}
      {extendTarget && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border p-6 max-w-md w-full space-y-4">
            <h3 className="font-heading text-xl font-bold uppercase text-gn-ivory">
              EXTEND MEMBERSHIP VALIDITY
            </h3>

            <div className="text-xs font-mono text-zinc-300 p-3 bg-gn-black border border-gn-border space-y-1">
              <div>MEMBER: <strong>{extendTarget.name}</strong></div>
              <div>PLAN: <strong>{extendTarget.plan?.name || 'GYM PASS'}</strong></div>
              <div>CURRENT EXPIRY: <strong>{new Date(extendTarget.endDate).toLocaleDateString('en-IN')}</strong></div>
            </div>

            <form onSubmit={handleExtend} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  ADDITIONAL DAYS TO ADD
                </label>
                <input
                  type="number"
                  min="1"
                  value={additionalDays}
                  onChange={(e) => setAdditionalDays(e.target.value)}
                  className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono text-gn-ivory focus:outline-none focus:border-gn-gold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  REASON FOR EXTENSION (AUDIT LOG)
                </label>
                <input
                  type="text"
                  placeholder="E.G. RENEWAL PAYMENT RECEIVED AT DESK / MEDICAL FREEZE"
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                  className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExtendTarget(null)}
                  className="px-4 py-2 border border-gn-border text-xs font-mono uppercase text-zinc-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={extending}
                  className="px-5 py-2 bg-gn-maroon text-gn-ivory font-heading font-bold text-sm uppercase tracking-wider hover:bg-gn-maroon/80 disabled:opacity-40"
                >
                  {extending ? 'EXTENDING...' : 'CONFIRM EXTENSION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CANCEL MEMBERSHIP */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-red-900/60 p-6 max-w-sm w-full space-y-4">
            <h3 className="font-heading text-xl font-bold uppercase text-red-400">
              CANCEL MEMBERSHIP
            </h3>
            <p className="text-xs font-mono text-zinc-300 uppercase leading-relaxed">
              ARE YOU SURE YOU WANT TO DEACTIVATE THE ACTIVE PASS FOR{' '}
              <strong>{cancelTarget.name}</strong> ({cancelTarget.plan?.name || 'GYM PASS'})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="px-4 py-2 border border-gn-border text-xs font-mono uppercase text-zinc-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="px-4 py-2 bg-red-900/60 border border-red-800 text-white font-mono text-xs uppercase tracking-wider hover:bg-red-800 disabled:opacity-40"
              >
                {cancelling ? 'CANCELLING...' : 'CONFIRM DEACTIVATION'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DIGITAL MEMBERSHIP CARD VIEWER & PDF PRINT */}
      {cardTarget && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gn-surface border border-gn-border p-6 max-w-xl w-full space-y-5">
            <div className="flex items-center justify-between border-b border-gn-border pb-3">
              <div>
                <h3 className="font-heading text-xl font-bold uppercase text-gn-ivory">
                  OFFICIAL ATHLETE PASS &bull; {cardTarget.name}
                </h3>
                <span className="text-[10px] font-mono text-gn-gold uppercase">
                  SOURCE: {cardTarget.source === 'ONLINE' ? 'ONLINE ENROLLMENT' : 'WALK-IN (FRONT DESK)'}
                </span>
              </div>
              <button
                onClick={() => setCardTarget(null)}
                className="p-1 text-zinc-400 hover:text-white font-mono font-bold text-sm"
              >
                ✕ CLOSE
              </button>
            </div>

            {/* Official Digital Membership Card Preview */}
            <div className="bg-gradient-to-br from-[#1A1616] via-[#100D0D] to-[#0A0808] border-2 border-[#F2B91D] p-6 shadow-2xl relative overflow-hidden text-white">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7A1F25] via-[#F2B91D] to-[#7A1F25]" />

              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/gymnationlogo.png" alt="GymNation" className="w-10 h-10 object-contain" />
                  <div>
                    <div className="font-heading text-xl font-black tracking-widest text-white uppercase leading-none">
                      GYMNATION
                    </div>
                    <div className="text-[9px] font-mono text-[#F2B91D] font-bold tracking-widest uppercase mt-0.5">
                      THE FITNESS HUB &bull; ATHLETE PASS
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest border ${
                    cardTarget.status === 'ACTIVE'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                      : 'bg-red-950/80 text-red-300 border-red-600'
                  }`}>
                    {cardTarget.status}
                  </span>
                  <div className="text-[9px] font-mono text-zinc-400 uppercase mt-0.5">
                    {cardTarget.source === 'ONLINE' ? 'ONLINE VERIFIED' : 'WALK-IN DESK'}
                  </div>
                </div>
              </div>

              {/* Member Details & QR */}
              <div className="py-4 grid grid-cols-12 gap-3 items-center">
                <div className="col-span-8 space-y-1">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 font-bold block">
                    REGISTERED ATHLETE
                  </span>
                  <div className="font-heading text-2xl font-black uppercase text-white tracking-wide truncate">
                    {cardTarget.name}
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="px-2 py-0.5 bg-[#7A1F25] text-white font-heading font-black text-[11px] uppercase tracking-wider">
                      {cardTarget.plan?.name || 'OFFICIAL GYM PASS'}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#F2B91D]">
                      {cardTarget.plan?.durationDays || 30} DAYS PASS
                    </span>
                  </div>
                  <div className="pt-2 text-[10px] font-mono text-zinc-300 space-y-0.5">
                    <div>PHONE: <strong className="text-white">{cardTarget.phone}</strong></div>
                    {cardTarget.email && <div className="truncate">EMAIL: {cardTarget.email}</div>}
                  </div>
                </div>

                {/* QR Vector Graphic */}
                <div className="col-span-4 flex flex-col items-center justify-center space-y-1.5">
                  <div className="p-1.5 bg-white border border-white/20 rounded shadow">
                    <svg className="w-16 h-16" viewBox="0 0 100 100" fill="black">
                      <rect x="0" y="0" width="30" height="30" fill="black" />
                      <rect x="5" y="5" width="20" height="20" fill="white" />
                      <rect x="10" y="10" width="10" height="10" fill="black" />
                      <rect x="70" y="0" width="30" height="30" fill="black" />
                      <rect x="75" y="5" width="20" height="20" fill="white" />
                      <rect x="80" y="10" width="10" height="10" fill="black" />
                      <rect x="0" y="70" width="30" height="30" fill="black" />
                      <rect x="5" y="75" width="20" height="20" fill="white" />
                      <rect x="10" y="80" width="10" height="10" fill="black" />
                      <rect x="36" y="8" width="6" height="6" />
                      <rect x="48" y="8" width="6" height="6" />
                      <rect x="36" y="20" width="6" height="6" />
                      <rect x="52" y="20" width="6" height="6" />
                      <rect x="40" y="32" width="6" height="6" />
                      <rect x="20" y="44" width="6" height="6" />
                      <rect x="32" y="44" width="6" height="6" />
                      <rect x="48" y="44" width="6" height="6" />
                      <rect x="64" y="44" width="6" height="6" />
                      <rect x="8" y="56" width="6" height="6" />
                      <rect x="40" y="56" width="6" height="6" />
                      <rect x="72" y="56" width="6" height="6" />
                    </svg>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest text-center">
                    TURNSTILE PASS
                  </span>
                </div>
              </div>

              {/* Start Date & End Date Validity */}
              <div className="p-3 bg-black/60 border border-white/10 rounded-sm grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-[#F2B91D] uppercase font-bold tracking-wider block">
                    START DATE
                  </span>
                  <strong className="text-white text-xs block mt-0.5">
                    {new Date(cardTarget.startDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>
                </div>

                <div>
                  <span className="text-[9px] text-[#F2B91D] uppercase font-bold tracking-wider block">
                    EXPIRY / END DATE
                  </span>
                  <strong className="text-white text-xs block mt-0.5">
                    {new Date(cardTarget.endDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>
                </div>
              </div>

              {/* Card Footer Strip - Unique Pass ID */}
              <div className="pt-3 mt-3 border-t border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase text-zinc-400 font-semibold tracking-wider block">
                    UNIQUE PASS ID
                  </span>
                  <span className="font-mono text-base font-bold text-[#F2B91D] tracking-widest block mt-0.5">
                    GN-{cardTarget.source === 'ONLINE' ? 'ONL' : 'WLK'}-{cardTarget.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-[#F2B91D]/30 text-zinc-300 font-mono text-[9px] tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>VERIFIED PASS</span>
                </div>
              </div>
            </div>

            {/* Print & Action Controls */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-xs font-mono text-zinc-400">
                Ready to print member pass or save as PDF
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-[#F2B91D] hover:bg-white text-black font-heading font-black text-xs uppercase tracking-widest transition-colors flex items-center gap-2 shadow-lg"
                >
                  <span>🖨️ PRINT / SAVE PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCardTarget(null)}
                  className="px-4 py-2.5 border border-gn-border text-xs font-mono uppercase text-zinc-300 hover:text-white"
                >
                  DONE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
