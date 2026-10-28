'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';

interface LeadItem {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  goal?: string | null;
  source: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';
  assignedTo?: string | null;
  notes?: string | null;
  createdAt: string;
}

const STATUS_TABS = [
  { label: 'ALL LEADS', value: 'ALL' },
  { label: 'NEW', value: 'NEW' },
  { label: 'CONTACTED', value: 'CONTACTED' },
  { label: 'CONVERTED', value: 'CONVERTED' },
  { label: 'CLOSED', value: 'CLOSED' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('');
  const [search, setSearch] = useState('');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Edit / Details Modal State
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [editStatus, setEditStatus] = useState<LeadItem['status']>('NEW');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingLead, setSavingLead] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<LeadItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;
      if (search.trim()) params.search = search.trim();

      const res = await apiClient.get('/admin/leads', { params });
      if (res.data?.success) {
        setLeads(res.data.data.leads);
        setStatusCounts(res.data.data.statusCounts || {});
        setTotalPages(res.data.data.totalPages || 1);
        setTotalCount(res.data.data.total || 0);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load leads' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, sourceFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const openEditModal = (lead: LeadItem) => {
    setSelectedLead(lead);
    setEditStatus(lead.status);
    setEditAssignedTo(lead.assignedTo || '');
    setEditNotes(lead.notes || '');
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      setSavingLead(true);
      const res = await apiClient.patch(`/admin/leads/${selectedLead.id}`, {
        status: editStatus,
        assignedTo: editAssignedTo.trim() || null,
        notes: editNotes.trim() || null,
      });

      if (res.data?.success) {
        setFeedback({ type: 'success', message: 'Lead updated successfully' });
        setSelectedLead(null);
        fetchLeads();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update lead' });
    } finally {
      setSavingLead(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await apiClient.delete(`/admin/leads/${deleteTarget.id}`);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: 'Lead deleted successfully' });
        setDeleteTarget(null);
        fetchLeads();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete lead' });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONVERTED':
        return 'bg-green-950/60 text-green-400 border-green-800';
      case 'CONTACTED':
        return 'bg-blue-950/60 text-blue-400 border-blue-800';
      case 'NEW':
        return 'bg-gn-gold/20 text-gn-gold border-gn-gold/40';
      case 'CLOSED':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'FREE_TRIAL':
        return 'bg-gn-maroon/20 text-gn-ivory border-gn-maroon';
      case 'HERO':
        return 'bg-amber-950/40 text-amber-300 border-amber-800';
      default:
        return 'bg-zinc-900 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gn-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl font-extrabold tracking-wider uppercase text-gn-ivory">
              LEADS & ENQUIRIES
            </h1>
            <span className="text-xs font-mono uppercase bg-gn-maroon/30 text-gn-ivory px-2.5 py-1 border border-gn-maroon/60">
              {totalCount} TOTAL LEADS
            </span>
          </div>
          <p className="text-xs text-gn-muted font-mono uppercase tracking-widest mt-1">
            FITNESS COUNSELOR PIPELINE, TRIAL PASSES, & WALK-IN CONVERSIONS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5000/api/v1/admin/leads/export/csv"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gn-black border border-gn-border text-xs font-mono uppercase tracking-wider text-gn-ivory hover:border-gn-gold hover:text-gn-gold transition-colors"
          >
            EXPORT CSV
          </a>
          <button
            onClick={() => fetchLeads()}
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

      {/* Pipeline Status Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-gn-border overflow-x-auto pb-px">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.value;
          const count = tab.value === 'ALL' ? statusCounts.ALL || 0 : statusCounts[tab.value] || 0;
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

      {/* Search and Source Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gn-surface p-4 border border-gn-border">
        <form onSubmit={handleSearchSubmit} className="md:col-span-3 flex gap-2">
          <input
            type="text"
            placeholder="SEARCH BY NAME, PHONE, EMAIL, FITNESS GOAL..."
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
                fetchLeads();
              }}
              className="px-3 py-2 border border-gn-border text-xs font-mono uppercase text-gn-muted hover:text-white"
            >
              CLEAR
            </button>
          )}
        </form>

        <div>
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gn-black border border-gn-border px-3 py-2 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
          >
            <option value="">ALL SOURCES</option>
            <option value="CONTACT">CONTACT FORM</option>
            <option value="FREE_TRIAL">FREE TRIAL PASS</option>
            <option value="HERO">HERO SECTION</option>
            <option value="CTA_BAND">CTA BAND</option>
            <option value="POPUP">EXIT POPUP</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="border border-gn-border bg-gn-surface overflow-x-auto">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead>
            <tr className="border-b border-gn-border bg-gn-black/60 text-[11px] font-mono uppercase tracking-widest text-gn-muted">
              <th className="p-4">LEAD NAME</th>
              <th className="p-4">CONTACT</th>
              <th className="p-4">GOAL & MESSAGE</th>
              <th className="p-4 text-center">SOURCE</th>
              <th className="p-4 text-center">STATUS</th>
              <th className="p-4">COUNSELOR</th>
              <th className="p-4">DATE</th>
              <th className="p-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gn-border text-xs">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-gn-muted font-mono uppercase tracking-widest">
                  FETCHING LEADS PIPELINE...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-gn-muted font-mono uppercase tracking-widest">
                  NO LEADS FOUND MATCHING YOUR FILTERS.
                </td>
              </tr>
            ) : (
              leads.map((l) => (
                <tr key={l.id} className="hover:bg-gn-black/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gn-ivory uppercase tracking-wider">{l.name}</div>
                  </td>

                  <td className="p-4 font-mono text-[11px]">
                    <div className="text-gn-gold font-semibold">{l.phone}</div>
                    {l.email && <div className="text-zinc-400 mt-0.5">{l.email}</div>}
                  </td>

                  <td className="p-4">
                    <div className="max-w-[240px]">
                      {l.goal && (
                        <div className="font-semibold text-gn-ivory uppercase text-[11px]">
                          Goal: {l.goal}
                        </div>
                      )}
                      {l.message && (
                        <div className="text-zinc-400 truncate text-[11px] mt-0.5" title={l.message}>
                          {l.message}
                        </div>
                      )}
                      {l.notes && (
                        <div className="text-zinc-500 font-mono text-[10px] mt-1 truncate" title={l.notes}>
                          Note: {l.notes}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${getSourceBadge(l.source)}`}>
                      {l.source.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border ${getStatusBadge(l.status)}`}>
                      {l.status}
                    </span>
                  </td>

                  <td className="p-4 font-mono text-[11px] text-zinc-300 uppercase">
                    {l.assignedTo || <span className="text-zinc-600">UNASSIGNED</span>}
                  </td>

                  <td className="p-4 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(l)}
                        className="px-3 py-1.5 bg-gn-black border border-gn-border text-[11px] font-mono uppercase tracking-wider text-gn-ivory hover:border-gn-gold hover:text-gn-gold transition-colors"
                      >
                        MANAGE
                      </button>
                      <button
                        onClick={() => setDeleteTarget(l)}
                        className="px-2.5 py-1.5 bg-gn-black border border-red-900/60 text-[11px] font-mono uppercase tracking-wider text-red-400 hover:border-red-600 transition-colors"
                      >
                        DELETE
                      </button>
                    </div>
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
              PAGE {page} OF {totalPages} ({totalCount} LEADS TOTAL)
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

      {/* MODAL: MANAGE LEAD */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-gn-border pb-3">
              <h3 className="font-heading text-xl font-bold uppercase text-gn-ivory">
                MANAGE LEAD: {selectedLead.name}
              </h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-zinc-500 hover:text-white font-mono text-xs uppercase"
              >
                CLOSE
              </button>
            </div>

            <div className="p-3 bg-gn-black border border-gn-border text-xs font-mono space-y-1">
              <div>PHONE: <strong className="text-gn-gold">{selectedLead.phone}</strong></div>
              <div>EMAIL: <strong>{selectedLead.email || 'N/A'}</strong></div>
              <div>SOURCE: <strong>{selectedLead.source}</strong></div>
              {selectedLead.goal && <div>GOAL: <strong>{selectedLead.goal}</strong></div>}
              {selectedLead.message && (
                <div className="pt-1 text-zinc-400">
                  MSG: <em>&ldquo;{selectedLead.message}&rdquo;</em>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveLead} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  LEAD STATUS
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as LeadItem['status'])}
                  className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
                >
                  <option value="NEW">NEW (UNTOUCHED)</option>
                  <option value="CONTACTED">CONTACTED (CALL / WHATSAPP)</option>
                  <option value="CONVERTED">CONVERTED (PURCHASED MEMBERSHIP / TRIAL)</option>
                  <option value="CLOSED">CLOSED (NOT INTERESTED / INVALID)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  ASSIGNED COUNSELOR / TRAINER
                </label>
                <input
                  type="text"
                  placeholder="E.G. RAHUL MEHTA / SURAT DESK"
                  value={editAssignedTo}
                  onChange={(e) => setEditAssignedTo(e.target.value)}
                  className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  COUNSELOR LOG & NOTES
                </label>
                <textarea
                  rows={3}
                  placeholder="E.G. CALLED ON 27 OCT: PROMISED TO VISIT ON WEDNESDAY EVENING FOR BODY COMPOSITION SCAN."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gn-border">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 border border-gn-border text-xs font-mono uppercase text-zinc-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="px-5 py-2 bg-gn-maroon text-gn-ivory font-heading font-bold text-sm uppercase tracking-wider hover:bg-gn-maroon/80 disabled:opacity-40"
                >
                  {savingLead ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-red-900/60 p-6 max-w-sm w-full space-y-4">
            <h3 className="font-heading text-xl font-bold uppercase text-red-400">
              DELETE LEAD RECORD
            </h3>
            <p className="text-xs font-mono text-zinc-300 uppercase leading-relaxed">
              ARE YOU SURE YOU WANT TO PERMANENTLY REMOVE THE LEAD FOR{' '}
              <strong>{deleteTarget.name}</strong> ({deleteTarget.phone})?
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
                onClick={handleDeleteLead}
                className="px-4 py-2 bg-red-900/60 border border-red-800 text-white font-mono text-xs uppercase tracking-wider hover:bg-red-800 disabled:opacity-40"
              >
                {deleting ? 'DELETING...' : 'CONFIRM DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
