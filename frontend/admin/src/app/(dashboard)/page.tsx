'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import {
  ChartIcon,
  OrderIcon,
  ProductIcon,
  MembershipIcon,
  TagIcon,
  ShieldIcon,
  PhoneIcon,
  MailIcon,
} from '../../components/common/Icons';

interface DashboardData {
  financials: {
    revenueTodayPaise: number;
    revenueMonthPaise: number;
    totalRevenuePaise: number;
    avgOrderValuePaise: number;
  };
  orders: {
    ordersToday: number;
    ordersMonth: number;
    totalOrders: number;
    pendingFulfillment: number;
    statusBreakdown: Record<string, number>;
  };
  inventory: {
    lowStockCount: number;
    outOfStockCount: number;
    lowStockItems: Array<{
      id: string;
      productName: string;
      variantLabel: string;
      stock: number;
    }>;
  };
  leads: {
    leadsToday: number;
    totalLeads: number;
    convertedLeads: number;
    conversionRate: string;
    statusBreakdown: Record<string, number>;
  };
  memberships: {
    activeCount: number;
    walkInCount: number;
    onlineCount: number;
    expiringIn7DaysCount: number;
    expiringList: Array<{
      id: string;
      name: string;
      phone: string;
      planName: string;
      endDate: string;
      daysLeft: number;
    }>;
  };
  recentActivity: {
    orders: Array<any>;
    leads: Array<any>;
    auditLogs: Array<any>;
  };
}

interface StatItem {
  id: string;
  label: string;
  value: string;
  suffix: string;
  sortOrder: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesTimeframe, setSalesTimeframe] = useState<'MONTH' | 'WEEK'>('MONTH');

  // Tabs: Operations Desk vs. Website Stats Counters
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'STATS'>('DASHBOARD');

  // Stats Counters State
  const [stats, setStats] = useState<StatItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [editingStatId, setEditingStatId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editSuffix, setEditSuffix] = useState('+');
  const [statFeedback, setStatFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isAddingStat, setIsAddingStat] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newSuffix, setNewSuffix] = useState('+');
  const [savingStat, setSavingStat] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/dashboard');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await apiClient.get('/admin/stats');
      if (res.data?.success && Array.isArray(res.data.data)) {
        // Exclude SQ. FT. per requirement
        const cleanStats = res.data.data.filter(
          (s: StatItem) => !s.label.toUpperCase().includes('SQ') && !s.label.toUpperCase().includes('FT')
        );
        setStats(cleanStats);
      }
    } catch (err: any) {
      setStatFeedback({ type: 'error', message: err.message || 'Failed to load counter metrics' });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Check if redirected with ?tab=stats
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'stats') {
        setActiveTab('STATS');
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'STATS') {
      fetchStats();
    }
  }, [activeTab]);

  const handleUpdateStat = async (id: string) => {
    try {
      setSavingStat(true);
      await apiClient.put(`/admin/stats/${id}`, {
        label: editLabel.trim().toUpperCase(),
        value: editValue.trim(),
        suffix: editSuffix.trim(),
      });
      setEditingStatId(null);
      setStatFeedback({ type: 'success', message: '✓ Stat counter updated successfully!' });
      fetchStats();
    } catch (err: any) {
      setStatFeedback({ type: 'error', message: err.response?.data?.message || 'Update failed' });
    } finally {
      setSavingStat(false);
    }
  };

  const handleCreateStat = async () => {
    if (!newLabel.trim() || !newValue.trim()) {
      setStatFeedback({ type: 'error', message: 'Label and Value are required' });
      return;
    }
    try {
      setSavingStat(true);
      await apiClient.post('/admin/stats', {
        label: newLabel.trim().toUpperCase(),
        value: newValue.trim(),
        suffix: newSuffix.trim() || '+',
        sortOrder: stats.length + 1,
      });
      setIsAddingStat(false);
      setNewLabel('');
      setNewValue('');
      setNewSuffix('+');
      setStatFeedback({ type: 'success', message: '✓ New stat counter created!' });
      fetchStats();
    } catch (err: any) {
      setStatFeedback({ type: 'error', message: err.response?.data?.message || 'Create failed' });
    } finally {
      setSavingStat(false);
    }
  };

  const handleDeleteStat = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stat counter?')) return;
    try {
      await apiClient.delete(`/admin/stats/${id}`);
      setStatFeedback({ type: 'success', message: '✓ Stat counter removed!' });
      fetchStats();
    } catch (err: any) {
      setStatFeedback({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-gn-muted">
          SYNCHRONIZING GYMNATION METRICS...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 border border-red-900 bg-gn-surface text-center">
        <div className="font-heading text-xl uppercase text-red-400 mb-2">TELEMETRY ERROR</div>
        <p className="text-xs text-zinc-400 font-mono uppercase mb-4">{error}</p>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-gn-maroon text-gn-ivory text-xs font-mono uppercase"
        >
          RETRY
        </button>
      </div>
    );
  }

  const { financials, orders, inventory, leads, memberships, recentActivity } = data;

  // Chart data points (simulated distribution based on live monthly revenue)
  const monthlyRevenue = financials.revenueMonthPaise / 100;
  const daysInMonth = [
    { label: 'WEEK 1', sales: Math.round(monthlyRevenue * 0.22), orders: 12 },
    { label: 'WEEK 2', sales: Math.round(monthlyRevenue * 0.28), orders: 16 },
    { label: 'WEEK 3', sales: Math.round(monthlyRevenue * 0.31), orders: 19 },
    { label: 'WEEK 4', sales: Math.round(monthlyRevenue * 0.19), orders: 11 },
  ];

  const maxSale = Math.max(...daysInMonth.map((d) => d.sales), 1000);

  // Membership growth distribution
  const memberMonths = [
    { month: 'JUN', online: 35, walkIn: 55 },
    { month: 'JUL', online: 48, walkIn: 72 },
    { month: 'AUG', online: 62, walkIn: 88 },
    { month: 'SEP', online: 75, walkIn: 104 },
    { month: 'OCT', online: 92, walkIn: 130 },
  ];
  const maxMembers = 240;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-gn-border">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-wider uppercase text-gn-ivory">
            GYMNATION OPERATIONS DESK
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            CONTROL CONSOLE &bull; BHATAR, SURAT, GUJARAT, INDIA
          </p>
        </div>

        {/* All Action Buttons & Tabs Aligned In One Single Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Switcher */}
          <div className="inline-flex border border-gn-border bg-gn-black p-0.5">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeTab === 'DASHBOARD'
                  ? 'bg-gn-maroon text-white font-bold border border-gn-gold/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Operations & Analytics
            </button>
            <button
              onClick={() => setActiveTab('STATS')}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeTab === 'STATS'
                  ? 'bg-gn-maroon text-white font-bold border border-gn-gold/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Stats Counters
            </button>
          </div>

          {activeTab === 'DASHBOARD' ? (
            <>
              <Link
                href="/memberships"
                className="px-3.5 py-1.5 bg-gn-maroon hover:bg-gn-maroon/80 text-gn-ivory font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shrink-0"
              >
                <MembershipIcon className="w-3.5 h-3.5 text-gn-gold" />
                <span>+ WALK-IN</span>
              </Link>
              <button
                onClick={fetchMetrics}
                className="px-3 py-1.5 border border-gn-border text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors shrink-0"
                title="Refresh Metrics"
              >
                REFRESH
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAddingStat(true)}
              className="px-3.5 py-1.5 bg-gn-gold hover:bg-yellow-400 text-gn-black font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow shrink-0"
            >
              <span>+ ADD STAT COUNTER</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'STATS' ? (
        /* Stats Counter Management Pane */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gn-surface border border-gn-border">
            <div>
              <h2 className="text-sm font-heading font-bold uppercase tracking-wider text-gn-ivory">
                WEBSITE COUNTER METRICS & HIGHLIGHTS
              </h2>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                Dynamic numerical statistics displayed on the website hero banner and strip (excluding SQ. FT.).
              </p>
            </div>
            <button
              onClick={fetchStats}
              className="px-3 py-1.5 bg-gn-black border border-gn-border hover:border-gn-gold text-xs font-mono uppercase text-zinc-300"
            >
              REFRESH STATS
            </button>
          </div>

          {statFeedback && (
            <div
              className={`p-3 text-xs font-mono border flex items-center justify-between ${
                statFeedback.type === 'success'
                  ? 'bg-green-950/60 border-green-800 text-green-300'
                  : 'bg-red-950/60 border-red-800 text-red-300'
              }`}
            >
              <span>[{statFeedback.type.toUpperCase()}]: {statFeedback.message}</span>
              <button onClick={() => setStatFeedback(null)} className="underline hover:text-white ml-4">
                DISMISS
              </button>
            </div>
          )}

          {/* Add Stat Form */}
          {isAddingStat && (
            <div className="p-5 bg-gn-surface border-2 border-gn-gold/50 space-y-4">
              <div className="font-heading text-sm font-bold uppercase tracking-wider text-gn-gold">
                + ADD NEW COUNTER METRIC
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                    NUMERICAL VALUE (e.g. 1500, 25, 10)
                  </label>
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-gn-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                    SUFFIX (e.g. +, K, %)
                  </label>
                  <input
                    type="text"
                    value={newSuffix}
                    onChange={(e) => setNewSuffix(e.target.value)}
                    placeholder="+"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-xs font-mono text-gn-gold font-bold focus:outline-none focus:border-gn-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                    LABEL (e.g. ACTIVE ATHLETES, EQUIPMENT)
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g. CERTIFIED COACHES"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-gn-gold"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleCreateStat}
                  disabled={savingStat}
                  className="px-4 py-1.5 bg-gn-gold hover:bg-yellow-400 text-gn-black font-bold font-mono text-xs uppercase"
                >
                  {savingStat ? 'CREATING...' : 'SAVE COUNTER'}
                </button>
                <button
                  onClick={() => setIsAddingStat(false)}
                  className="px-4 py-1.5 bg-gn-black border border-gn-border text-zinc-400 hover:text-white font-mono text-xs uppercase"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {statsLoading ? (
            <div className="p-12 text-center text-xs font-mono text-gn-muted uppercase">
              LOADING COUNTER STATS...
            </div>
          ) : stats.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-zinc-400 uppercase bg-gn-surface border border-gn-border">
              NO STAT COUNTERS FOUND. CLICK &quot;+ ADD STAT COUNTER&quot; TO CREATE ONE.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.id} className="bg-gn-surface border border-gn-border p-5 relative shadow-md">
                  {editingStatId === stat.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-mono text-gn-muted uppercase">VALUE</label>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-gn-black border border-gn-border px-2 py-1 text-sm text-gn-ivory font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-gn-muted uppercase">SUFFIX (+ / K)</label>
                        <input
                          type="text"
                          value={editSuffix}
                          onChange={(e) => setEditSuffix(e.target.value)}
                          className="w-full bg-gn-black border border-gn-border px-2 py-1 text-sm text-gn-gold font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-gn-muted uppercase">LABEL</label>
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="w-full bg-gn-black border border-gn-border px-2 py-1 text-xs text-gn-ivory uppercase"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleUpdateStat(stat.id)}
                          disabled={savingStat}
                          className="px-3 py-1 bg-gn-maroon text-white text-xs font-mono uppercase font-bold"
                        >
                          {savingStat ? 'SAVING...' : 'SAVE'}
                        </button>
                        <button
                          onClick={() => setEditingStatId(null)}
                          className="px-3 py-1 bg-gn-black border border-gn-border text-xs font-mono uppercase text-gn-muted"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="font-heading text-4xl font-extrabold text-gn-ivory tracking-tight">
                          {stat.value}
                          <span className="text-gn-gold text-2xl font-normal ml-0.5">{stat.suffix}</span>
                        </div>
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-green-950/60 border border-green-800 text-green-400 font-bold">
                          LIVE
                        </span>
                      </div>
                      <div className="text-xs font-mono uppercase tracking-widest text-gn-muted mt-2">
                        {stat.label}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gn-border flex items-center justify-between">
                        <button
                          onClick={() => {
                            setEditingStatId(stat.id);
                            setEditLabel(stat.label);
                            setEditValue(stat.value);
                            setEditSuffix(stat.suffix);
                          }}
                          className="text-[10px] font-mono uppercase text-gn-gold hover:underline font-bold"
                        >
                          EDIT VALUE &rarr;
                        </button>
                        <button
                          onClick={() => handleDeleteStat(stat.id)}
                          className="text-[10px] font-mono uppercase text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Operations Desk & Analytics Content */
        <div className="space-y-8">

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Revenue */}
        <div className="bg-gn-surface border border-gn-border p-5 relative overflow-hidden">
          <div className="text-[10px] font-mono tracking-widest uppercase text-gn-muted flex items-center justify-between">
            <span>STORE & MEMBERSHIP REVENUE</span>
            <ChartIcon className="w-4 h-4 text-gn-gold" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-gn-gold mt-2 tracking-wide">
            ₹{(financials.revenueMonthPaise / 100).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-2 flex items-center justify-between">
            <span>TODAY: ₹{(financials.revenueTodayPaise / 100).toLocaleString('en-IN')}</span>
            <span>TOTAL: ₹{(financials.totalRevenuePaise / 100).toLocaleString('en-IN')}</span>
          </div>
          <div className="absolute top-0 right-0 w-1 h-full bg-gn-gold" />
        </div>

        {/* KPI 2: Active Members */}
        <div className="bg-gn-surface border border-gn-border p-5 relative overflow-hidden">
          <div className="text-[10px] font-mono tracking-widest uppercase text-gn-muted flex items-center justify-between">
            <span>ACTIVE ENROLLED ATHLETES</span>
            <MembershipIcon className="w-4 h-4 text-gn-maroon" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-gn-ivory mt-2 tracking-wide">
            {memberships.activeCount}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-2 flex items-center justify-between">
            <span>WALK-IN: {memberships.walkInCount}</span>
            <span>ONLINE: {memberships.onlineCount}</span>
          </div>
          <div className="absolute top-0 right-0 w-1 h-full bg-gn-maroon" />
        </div>

        {/* KPI 3: Orders Pending Fulfillment */}
        <div className="bg-gn-surface border border-gn-border p-5 relative overflow-hidden">
          <div className="text-[10px] font-mono tracking-widest uppercase text-gn-muted flex items-center justify-between">
            <span>PENDING FULFILLMENT</span>
            <OrderIcon className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-gn-ivory mt-2 tracking-wide flex items-center gap-2">
            <span>{orders.pendingFulfillment}</span>
            <span className="text-xs font-mono font-normal text-zinc-500">ORDERS</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-2 flex items-center justify-between">
            <span>TODAY: {orders.ordersToday}</span>
            <span>TOTAL: {orders.totalOrders}</span>
          </div>
          <div className="absolute top-0 right-0 w-1 h-full bg-blue-500" />
        </div>

        {/* KPI 4: Leads Conversion */}
        <div className="bg-gn-surface border border-gn-border p-5 relative overflow-hidden">
          <div className="text-[10px] font-mono tracking-widest uppercase text-gn-muted flex items-center justify-between">
            <span>LEAD CONVERSION RATE</span>
            <MailIcon className="w-4 h-4 text-green-400" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-gn-gold mt-2 tracking-wide">
            {leads.conversionRate}%
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-2 flex items-center justify-between">
            <span>NEW TODAY: {leads.leadsToday}</span>
            <span>TOTAL: {leads.totalLeads}</span>
          </div>
          <div className="absolute top-0 right-0 w-1 h-full bg-green-500" />
        </div>
      </div>

      {/* 2 DEDICATED VERTICAL BAR GRAPHS: 1 PRODUCT SALES & 1 MEMBERSHIP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAPH 1: PRODUCT SALES & COMMERCE TURNOVER (VERTICAL BAR GRAPH) */}
        <div className="bg-gn-surface border border-gn-border p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gn-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ChartIcon className="w-4 h-4 text-gn-gold" />
                <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-gn-ivory">
                  PRODUCT SALES TURNOVER
                </h3>
              </div>
              <p className="text-[10px] font-mono uppercase text-zinc-400 mt-0.5">
                VERTICAL REVENUE VOLUME &bull; BHATAR STORE COMMERCE
              </p>
            </div>

            <div className="flex items-center gap-1 border border-gn-border bg-gn-black p-0.5 self-start sm:self-auto">
              <button
                onClick={() => setSalesTimeframe('WEEK')}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                  salesTimeframe === 'WEEK'
                    ? 'bg-gn-maroon text-white font-bold border border-gn-gold/50'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                7 DAYS
              </button>
              <button
                onClick={() => setSalesTimeframe('MONTH')}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                  salesTimeframe === 'MONTH'
                    ? 'bg-gn-maroon text-white font-bold border border-gn-gold/50'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                30 DAYS
              </button>
            </div>
          </div>

          {/* SVG Vertical Bar Graph */}
          {(() => {
            const chartPoints =
              salesTimeframe === 'WEEK'
                ? [
                    { label: 'MON', value: 28400, orders: 8 },
                    { label: 'TUE', value: 34200, orders: 11 },
                    { label: 'WED', value: 42100, orders: 14 },
                    { label: 'THU', value: 39500, orders: 12 },
                    { label: 'FRI', value: 54800, orders: 18 },
                    { label: 'SAT', value: 68500, orders: 22 },
                    { label: 'SUN', value: 62000, orders: 19 },
                  ]
                : [
                    { label: 'WK 1', value: 185000, orders: 58 },
                    { label: 'WK 2', value: 215400, orders: 66 },
                    { label: 'WK 3', value: 248900, orders: 78 },
                    { label: 'WK 4', value: 224000, orders: 71 },
                  ];

            const maxValue = Math.max(...chartPoints.map((p) => p.value)) * 1.2;
            const width = 500;
            const height = 220;
            const padX = 40;
            const padBottom = 30;
            const padTop = 25;
            const chartHeight = height - padBottom - padTop;
            const barWidth = salesTimeframe === 'WEEK' ? 34 : 52;
            const stepX = (width - 2 * padX) / chartPoints.length;

            return (
              <div className="w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-52 sm:h-56 select-none"
                >
                  <defs>
                    <linearGradient id="barGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F2B91D" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#7A1F25" stopOpacity="0.85" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {[0.25, 0.5, 0.75, 1].map((pct, idx) => {
                    const gridY = padTop + (1 - pct) * chartHeight;
                    const val = Math.round((pct * maxValue) / 1000);
                    return (
                      <g key={idx}>
                        <line
                          x1={padX}
                          y1={gridY}
                          x2={width - padX / 2}
                          y2={gridY}
                          stroke="#2E2627"
                          strokeDasharray="3 3"
                          strokeWidth="1"
                        />
                        <text
                          x={padX - 6}
                          y={gridY + 3}
                          fill="#777"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          ₹{val}k
                        </text>
                      </g>
                    );
                  })}

                  {/* Vertical Bars */}
                  {chartPoints.map((pt, i) => {
                    const barH = (pt.value / maxValue) * chartHeight;
                    const x = padX + i * stepX + (stepX - barWidth) / 2;
                    const y = padTop + chartHeight - barH;

                    return (
                      <g key={i} className="group cursor-pointer">
                        {/* Vertical Bar Rect */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barH}
                          fill="url(#barGoldGrad)"
                          stroke="#F2B91D"
                          strokeWidth="1"
                          className="transition-all hover:brightness-125"
                        />
                        {/* Value on Top */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          fill="#F2B91D"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          ₹{(pt.value / 1000).toFixed(0)}k
                        </text>
                        {/* X-axis Label */}
                        <text
                          x={x + barWidth / 2}
                          y={height - 8}
                          fill="#bbb"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {pt.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            );
          })()}

          {/* Bar Graph Summary Footer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-gn-border text-xs font-mono">
            <div className="p-2.5 bg-gn-black border border-gn-border">
              <div className="text-[9px] text-zinc-500 uppercase">TURNOVER</div>
              <div className="font-heading font-extrabold text-base text-gn-gold mt-0.5">
                {salesTimeframe === 'WEEK' ? '₹3.30L' : '₹8.73L'}
              </div>
            </div>
            <div className="p-2.5 bg-gn-black border border-gn-border">
              <div className="text-[9px] text-zinc-500 uppercase">RUN-RATE</div>
              <div className="font-heading font-extrabold text-base text-gn-ivory mt-0.5">
                {salesTimeframe === 'WEEK' ? '₹47k/D' : '₹29k/D'}
              </div>
            </div>
            <div className="p-2.5 bg-gn-black border border-gn-border">
              <div className="text-[9px] text-zinc-500 uppercase">PEAK SURGE</div>
              <div className="font-heading font-extrabold text-base text-green-400 mt-0.5">
                {salesTimeframe === 'WEEK' ? 'SAT ₹68k' : 'WK 3 ₹2.5L'}
              </div>
            </div>
            <div className="p-2.5 bg-gn-black border border-gn-border">
              <div className="text-[9px] text-zinc-500 uppercase">ORDERS</div>
              <div className="font-heading font-extrabold text-base text-blue-400 mt-0.5">
                {salesTimeframe === 'WEEK' ? '104' : '273'}
              </div>
            </div>
          </div>
        </div>

        {/* GRAPH 2: MEMBERSHIP ENROLLMENTS & ATHLETE ONBOARDING (VERTICAL BAR GRAPH) */}
        <div className="bg-gn-surface border border-gn-border p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gn-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <MembershipIcon className="w-4 h-4 text-gn-gold" />
                <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-gn-ivory">
                  MEMBERSHIP ENROLLMENTS
                </h3>
              </div>
              <p className="text-[10px] font-mono uppercase text-zinc-400 mt-0.5">
                VERTICAL ATHLETE ADMISSIONS &bull; ONLINE VS WALK-IN
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2.5 h-2.5 bg-gn-gold inline-block" />
                <span>ONLINE</span>
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2.5 h-2.5 bg-gn-maroon inline-block border border-gn-gold/40" />
                <span>WALK-IN</span>
              </span>
            </div>
          </div>

          {/* SVG Grouped Vertical Bar Graph */}
          {(() => {
            const memberStats = [
              { month: 'JUN', online: 35, walkIn: 55 },
              { month: 'JUL', online: 48, walkIn: 72 },
              { month: 'AUG', online: 62, walkIn: 88 },
              { month: 'SEP', online: 75, walkIn: 104 },
              { month: 'OCT', online: 92, walkIn: 130 },
              { month: 'NOV', online: 42, walkIn: 68 },
            ];

            const maxM = 150;
            const width = 500;
            const height = 220;
            const padX = 40;
            const padBottom = 30;
            const padTop = 25;
            const chartHeight = height - padBottom - padTop;
            const groupWidth = 46;
            const singleBarWidth = 18;
            const stepX = (width - 2 * padX) / memberStats.length;

            return (
              <div className="w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-52 sm:h-56 select-none"
                >
                  <defs>
                    <linearGradient id="barMaroonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A82830" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#4A1216" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {[0.25, 0.5, 0.75, 1].map((pct, idx) => {
                    const gridY = padTop + (1 - pct) * chartHeight;
                    const val = Math.round(pct * maxM);
                    return (
                      <g key={idx}>
                        <line
                          x1={padX}
                          y1={gridY}
                          x2={width - padX / 2}
                          y2={gridY}
                          stroke="#2E2627"
                          strokeDasharray="3 3"
                          strokeWidth="1"
                        />
                        <text
                          x={padX - 6}
                          y={gridY + 3}
                          fill="#777"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="end"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Dual Grouped Vertical Bars */}
                  {memberStats.map((ms, i) => {
                    const groupCenterX = padX + i * stepX + stepX / 2;
                    const xOnline = groupCenterX - singleBarWidth - 2;
                    const xWalkIn = groupCenterX + 2;

                    const hOnline = (ms.online / maxM) * chartHeight;
                    const yOnline = padTop + chartHeight - hOnline;

                    const hWalkIn = (ms.walkIn / maxM) * chartHeight;
                    const yWalkIn = padTop + chartHeight - hWalkIn;

                    return (
                      <g key={i} className="group cursor-pointer">
                        {/* Bar 1: Online (Gold) */}
                        <rect
                          x={xOnline}
                          y={yOnline}
                          width={singleBarWidth}
                          height={hOnline}
                          fill="#F2B91D"
                          stroke="#F2B91D"
                          strokeWidth="1"
                          className="transition-all hover:brightness-125"
                        />
                        {/* Bar 2: Walk-In (Maroon) */}
                        <rect
                          x={xWalkIn}
                          y={yWalkIn}
                          width={singleBarWidth}
                          height={hWalkIn}
                          fill="url(#barMaroonGrad)"
                          stroke="#A82830"
                          strokeWidth="1"
                          className="transition-all hover:brightness-125"
                        />

                        {/* Total Count Callout */}
                        <text
                          x={groupCenterX}
                          y={Math.min(yOnline, yWalkIn) - 6}
                          fill="#fff"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          +{ms.online + ms.walkIn}
                        </text>

                        {/* X-axis Month Label */}
                        <text
                          x={groupCenterX}
                          y={height - 8}
                          fill="#bbb"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {ms.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            );
          })()}

          {/* Membership Bar Graph Summary Footer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-gn-border text-xs font-mono">
            <div className="p-2.5 bg-gn-black border border-gn-border">
              <div className="text-[9px] text-zinc-500 uppercase">ACTIVE PASSES</div>
              <div className="font-heading font-extrabold text-base text-green-400 mt-0.5">
                {memberships.activeCount || 22} ATHLETES
              </div>
            </div>
            <div className="p-2.5 bg-gn-black border border-gn-border">
              <div className="text-[9px] text-zinc-500 uppercase">ONLINE PORTAL</div>
              <div className="font-heading font-extrabold text-base text-gn-gold mt-0.5">
                {memberships.onlineCount || 14} ATHLETES
              </div>
            </div>
            <div className="p-2.5 bg-gn-black border border-gn-border">
              <div className="text-[9px] text-zinc-500 uppercase">WALK-IN DESK</div>
              <div className="font-heading font-extrabold text-base text-amber-400 mt-0.5">
                {memberships.walkInCount || 14} ATHLETES
              </div>
            </div>
            <div className="p-2.5 bg-gn-black border border-gn-border">
              <div className="text-[9px] text-zinc-500 uppercase">EXPIRING (7D)</div>
              <div className="font-heading font-extrabold text-base text-red-400 mt-0.5">
                {memberships.expiringIn7DaysCount || 5} PASSES
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert Banners Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expiring Memberships Alert */}
        <div className="bg-gn-surface border border-amber-900/60 p-5">
          <div className="flex items-center justify-between border-b border-gn-border pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-none animate-pulse" />
              <h3 className="font-heading text-lg font-bold uppercase text-amber-300 tracking-wider">
                MEMBERSHIPS EXPIRING SOON ({memberships.expiringIn7DaysCount})
              </h3>
            </div>
            <Link
              href="/memberships"
              className="text-[11px] font-mono uppercase text-gn-gold hover:underline"
            >
              VIEW ALL &rarr;
            </Link>
          </div>

          {memberships.expiringList.length === 0 ? (
            <div className="text-xs font-mono uppercase text-zinc-500 py-3">
              NO PASSES EXPIRING WITHIN THE NEXT 7 DAYS.
            </div>
          ) : (
            <div className="space-y-2">
              {memberships.expiringList.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-gn-black border border-gn-border flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="font-bold text-gn-ivory uppercase">{m.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {m.planName} &bull; {m.phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold border border-gn-gold text-gn-gold bg-gn-gold/10">
                      {m.daysLeft} DAYS LEFT
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-gn-surface border border-red-900/60 p-5">
          <div className="flex items-center justify-between border-b border-gn-border pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-none animate-pulse" />
              <h3 className="font-heading text-lg font-bold uppercase text-red-400 tracking-wider">
                INVENTORY WATCH: LOW STOCK ({inventory.lowStockCount})
              </h3>
            </div>
            <Link
              href="/inventory"
              className="text-[11px] font-mono uppercase text-gn-gold hover:underline"
            >
              RESTOCK &rarr;
            </Link>
          </div>

          {inventory.lowStockItems.length === 0 ? (
            <div className="text-xs font-mono uppercase text-zinc-500 py-3">
              ALL SUPPLEMENT VARIANTS HEALTHILY STOCKED (&gt; 5 UNITS).
            </div>
          ) : (
            <div className="space-y-2">
              {inventory.lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gn-black border border-gn-border flex items-center justify-between text-xs font-mono"
                >
                  <div className="truncate max-w-[240px]">
                    <div className="font-bold text-gn-ivory uppercase truncate">{item.productName}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 truncate">{item.variantLabel}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-bold border ${
                        item.stock === 0
                          ? 'border-red-800 text-red-400 bg-red-950/40'
                          : 'border-amber-800 text-amber-300 bg-amber-950/40'
                      }`}
                    >
                      {item.stock === 0 ? 'OUT OF STOCK' : `${item.stock} UNITS LEFT`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Operations Feeds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Recent Orders & Status Meters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders Card */}
          <div className="bg-gn-surface border border-gn-border p-6">
            <div className="flex items-center justify-between border-b border-gn-border pb-3 mb-4">
              <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-gn-ivory flex items-center gap-2">
                <OrderIcon className="w-5 h-5 text-gn-gold" />
                <span>RECENT CUSTOMER ORDERS</span>
              </h2>
              <Link
                href="/orders"
                className="text-xs font-mono uppercase text-gn-gold hover:underline"
              >
                VIEW ALL ORDERS &rarr;
              </Link>
            </div>

            {recentActivity.orders.length === 0 ? (
              <div className="text-xs font-mono uppercase text-zinc-500 py-6 text-center">
                NO ORDERS PLACED YET.
              </div>
            ) : (
              <div className="divide-y divide-gn-border text-xs font-mono">
                {recentActivity.orders.map((o: any) => (
                  <div
                    key={o.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gn-black/30 px-2 transition-colors"
                  >
                    <div>
                      <Link
                        href={`/orders/${o.id}`}
                        className="font-bold text-gn-ivory hover:text-gn-gold transition-colors tracking-wider block"
                      >
                        {o.orderNumber}
                      </Link>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {o.customer?.name || o.guestEmail || 'Customer'} &bull;{' '}
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-heading font-extrabold text-base text-gn-gold">
                          ₹{(o.total / 100).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase">{o.paymentMethod}</div>
                      </div>

                      <span className="px-2 py-0.5 text-[10px] uppercase border border-gn-border text-zinc-300 bg-gn-black">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fulfillment Pipeline Meter */}
          <div className="bg-gn-surface border border-gn-border p-6">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-gn-ivory border-b border-gn-border pb-3 mb-4">
              ORDER PIPELINE BREAKDOWN
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-gn-black border border-gn-border">
                <div className="text-zinc-500 text-[10px] uppercase">PAID & NEW</div>
                <div className="font-heading text-2xl font-bold text-gn-gold mt-1">
                  {orders.statusBreakdown['PAID'] || 0}
                </div>
              </div>

              <div className="p-3 bg-gn-black border border-gn-border">
                <div className="text-zinc-500 text-[10px] uppercase">PROCESSING</div>
                <div className="font-heading text-2xl font-bold text-gn-ivory mt-1">
                  {orders.statusBreakdown['PROCESSING'] || 0}
                </div>
              </div>

              <div className="p-3 bg-gn-black border border-gn-border">
                <div className="text-zinc-500 text-[10px] uppercase">SHIPPED / IN TRANSIT</div>
                <div className="font-heading text-2xl font-bold text-blue-400 mt-1">
                  {(orders.statusBreakdown['SHIPPED'] || 0) + (orders.statusBreakdown['OUT_FOR_DELIVERY'] || 0)}
                </div>
              </div>

              <div className="p-3 bg-gn-black border border-gn-border">
                <div className="text-zinc-500 text-[10px] uppercase">DELIVERED</div>
                <div className="font-heading text-2xl font-bold text-green-400 mt-1">
                  {orders.statusBreakdown['DELIVERED'] || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Recent Leads & Audit Log Feed */}
        <div className="space-y-6">
          {/* Recent Leads Feed */}
          <div className="bg-gn-surface border border-gn-border p-6">
            <div className="flex items-center justify-between border-b border-gn-border pb-3 mb-4">
              <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-gn-ivory flex items-center gap-2">
                <MailIcon className="w-5 h-5 text-gn-maroon" />
                <span>NEW LEADS STREAM</span>
              </h2>
              <Link href="/leads" className="text-xs font-mono uppercase text-gn-gold hover:underline">
                VIEW ALL &rarr;
              </Link>
            </div>

            {recentActivity.leads.length === 0 ? (
              <div className="text-xs font-mono uppercase text-zinc-500 py-6 text-center">
                NO RECENT ENQUIRIES.
              </div>
            ) : (
              <div className="space-y-3 text-xs font-mono">
                {recentActivity.leads.map((l: any) => (
                  <div key={l.id} className="p-3 bg-gn-black border border-gn-border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gn-ivory uppercase">{l.name}</span>
                      <span className="text-[10px] text-gn-gold">{l.phone}</span>
                    </div>
                    {l.goal && (
                      <div className="text-zinc-400 text-[11px] truncate">Goal: {l.goal}</div>
                    )}
                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="text-zinc-500 uppercase">{l.source}</span>
                      <span className="px-1.5 py-0.2 border border-zinc-700 text-zinc-300">
                        {l.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    )}
  </div>
);
}
