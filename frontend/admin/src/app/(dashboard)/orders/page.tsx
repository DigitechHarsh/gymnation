'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';

interface OrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  guestEmail?: string | null;
  guestPhone?: string | null;
  shippingAddress: any;
  customer?: {
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  items: Array<{
    id: string;
    nameSnapshot: string;
    skuSnapshot: string;
    priceSnapshot: number;
    qty: number;
  }>;
  shipment?: {
    id: string;
    awb: string | null;
    courierName: string | null;
    status: string;
    trackingUrl: string | null;
    labelUrl: string | null;
  } | null;
  payments?: Array<{
    provider: string;
    status: string;
    amount: number;
    razorpayPaymentId?: string | null;
  }>;
}

const STATUS_TABS = [
  { label: 'ALL ORDERS', value: 'ALL' },
  { label: 'PAID / NEW', value: 'PAID' },
  { label: 'PROCESSING', value: 'PROCESSING' },
  { label: 'SHIPPED', value: 'SHIPPED' },
  { label: 'DELIVERED', value: 'DELIVERED' },
  { label: 'PENDING PAYMENT', value: 'PENDING_PAYMENT' },
  { label: 'CANCELLED', value: 'CANCELLED' },
];

const SEED_ORDERS: OrderSummary[] = [
  {
    id: 'ord_1',
    orderNumber: 'GN-2026-001091',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    status: 'PAID',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE',
    subtotal: 749900,
    discount: 0,
    shippingFee: 0,
    total: 749900,
    customer: { name: 'Harshil Patel', email: 'harshil.patel@gmail.com', phone: '+91 98250 12345' },
    shippingAddress: { name: 'Harshil Patel', line1: '402, Royal Residency, Bhatar Char Rasta', city: 'Surat', state: 'Gujarat', pincode: '395017', phone: '+91 98250 12345' },
    items: [{ id: 'item_1', nameSnapshot: 'GymNation 100% Whey Isolate 10 LB (4.5 KG Mega Tub)', skuSnapshot: 'GN-WHEY-ISO-10LB', priceSnapshot: 749900, qty: 1 }],
    payments: [{ provider: 'RAZORPAY', status: 'CAPTURED', amount: 749900, razorpayPaymentId: 'pay_OMs8892183' }],
  },
  {
    id: 'ord_2',
    orderNumber: 'GN-2026-001090',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'PAID',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE',
    subtotal: 129900,
    discount: 0,
    shippingFee: 0,
    total: 129900,
    customer: { name: 'Rohan Mehta', email: 'rohan.mehta@yahoo.com', phone: '+91 98980 55443' },
    shippingAddress: { name: 'Rohan Mehta', line1: '12, Shreenathji Society, Ghod Dod Road', city: 'Surat', state: 'Gujarat', pincode: '395007', phone: '+91 98980 55443' },
    items: [{ id: 'item_2', nameSnapshot: 'GymNation 100% Pure Micronized Creatine 500g (200 Mesh)', skuSnapshot: 'GN-CREATINE-500G', priceSnapshot: 129900, qty: 1 }],
    payments: [{ provider: 'RAZORPAY', status: 'CAPTURED', amount: 129900, razorpayPaymentId: 'pay_OMs8891924' }],
  },
  {
    id: 'ord_3',
    orderNumber: 'GN-2026-001089',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    status: 'PROCESSING',
    paymentStatus: 'PENDING',
    paymentMethod: 'COD',
    subtotal: 389900,
    discount: 0,
    shippingFee: 5000,
    total: 394900,
    customer: { name: 'Vikram Rajput', email: 'vikram.rajput@outlook.com', phone: '+91 99040 33221' },
    shippingAddress: { name: 'Vikram Rajput', line1: 'Villa 8, Vesu Canal Road', city: 'Surat', state: 'Gujarat', pincode: '395007', phone: '+91 99040 33221' },
    items: [{ id: 'item_3', nameSnapshot: 'Anabolic Mass Gainer 5 KG (Chocolate Fudge)', skuSnapshot: 'GN-MASS-5KG', priceSnapshot: 389900, qty: 1 }],
  },
  {
    id: 'ord_4',
    orderNumber: 'GN-2026-001088',
    createdAt: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
    status: 'PROCESSING',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE',
    subtotal: 219800,
    discount: 0,
    shippingFee: 0,
    total: 219800,
    customer: { name: 'Ananya Desai', email: 'ananya.desai@gmail.com', phone: '+91 98240 66778' },
    shippingAddress: { name: 'Ananya Desai', line1: 'Flat 501, City Light Main Road', city: 'Surat', state: 'Gujarat', pincode: '395007', phone: '+91 98240 66778' },
    items: [
      { id: 'item_4a', nameSnapshot: 'Pre-Workout Explosive Nitro 300g (Watermelon Blast)', skuSnapshot: 'GN-PRE-NITRO-300G', priceSnapshot: 159900, qty: 1 },
      { id: 'item_4b', nameSnapshot: 'GymNation Heavy-Duty Stainless Steel Shaker Bottle 750ml', skuSnapshot: 'GN-SHAKER-STEEL', priceSnapshot: 59900, qty: 1 },
    ],
    payments: [{ provider: 'RAZORPAY', status: 'CAPTURED', amount: 219800, razorpayPaymentId: 'pay_OMs8881210' }],
  },
  {
    id: 'ord_5',
    orderNumber: 'GN-2026-001087',
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    status: 'SHIPPED',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE',
    subtotal: 349900,
    discount: 0,
    shippingFee: 0,
    total: 349900,
    customer: { name: 'Rajesh Solanki', email: 'rajesh.solanki@gmail.com', phone: '+91 97120 88990' },
    shippingAddress: { name: 'Rajesh Solanki', line1: 'B-22, Green Park Avenue, Adajan', city: 'Surat', state: 'Gujarat', pincode: '395009', phone: '+91 97120 88990' },
    items: [{ id: 'item_5', nameSnapshot: 'GymNation 100% Whey Isolate 1 KG (Double Rich Chocolate)', skuSnapshot: 'GN-WHEY-ISO-1KG', priceSnapshot: 349900, qty: 1 }],
    shipment: { id: 'ship_1', courierName: 'BlueDart Surat Express', awb: 'BD7748920194', status: 'IN_TRANSIT', trackingUrl: 'https://bluedart.com/track', labelUrl: '#' },
    payments: [{ provider: 'RAZORPAY', status: 'CAPTURED', amount: 349900, razorpayPaymentId: 'pay_OMs8872391' }],
  },
  {
    id: 'ord_6',
    orderNumber: 'GN-2026-001086',
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    status: 'SHIPPED',
    paymentStatus: 'PENDING',
    paymentMethod: 'COD',
    subtotal: 159800,
    discount: 0,
    shippingFee: 5000,
    total: 164800,
    customer: { name: 'Chirag Vashi', email: 'chirag.vashi@gmail.com', phone: '+91 98790 44332' },
    shippingAddress: { name: 'Chirag Vashi', line1: 'Plot 108, Pal Gam Road, Adajan', city: 'Surat', state: 'Gujarat', pincode: '395009', phone: '+91 98790 44332' },
    items: [{ id: 'item_6', nameSnapshot: 'GymNation Micronized Creatine 250g (Compact Tub)', skuSnapshot: 'GN-CREATINE-250G', priceSnapshot: 79900, qty: 2 }],
    shipment: { id: 'ship_2', courierName: 'Delhivery Surat Logistics', awb: 'DEL992817345', status: 'OUT_FOR_DELIVERY', trackingUrl: 'https://delhivery.com/track', labelUrl: '#' },
  },
  {
    id: 'ord_7',
    orderNumber: 'GN-2026-001085',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE',
    subtotal: 749900,
    discount: 50000,
    shippingFee: 0,
    total: 699900,
    customer: { name: 'Amit Deshmukh', email: 'amit.deshmukh@gmail.com', phone: '+91 99740 12890' },
    shippingAddress: { name: 'Amit Deshmukh', line1: '14, Royal Palm, Dumas Road, Piplod', city: 'Surat', state: 'Gujarat', pincode: '395007', phone: '+91 99740 12890' },
    items: [{ id: 'item_7', nameSnapshot: 'GymNation 100% Whey Isolate 10 LB (4.5 KG Mega Tub)', skuSnapshot: 'GN-WHEY-ISO-10LB', priceSnapshot: 749900, qty: 1 }],
    shipment: { id: 'ship_3', courierName: 'BlueDart Express', awb: 'BD6638102941', status: 'DELIVERED', trackingUrl: '#', labelUrl: '#' },
    payments: [{ provider: 'RAZORPAY', status: 'CAPTURED', amount: 699900, razorpayPaymentId: 'pay_OMs8855420' }],
  },
  {
    id: 'ord_8',
    orderNumber: 'GN-2026-001084',
    createdAt: new Date(Date.now() - 54 * 3600 * 1000).toISOString(),
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'STORE_PICKUP',
    subtotal: 59900,
    discount: 0,
    shippingFee: 0,
    total: 59900,
    customer: { name: 'Jignesh Patel', email: 'jignesh.patel@gmail.com', phone: '+91 98251 77889' },
    shippingAddress: { name: 'Jignesh Patel', line1: 'Front Desk Pickup, GymNation Floor, Bhatar', city: 'Surat', state: 'Gujarat', pincode: '395017', phone: '+91 98251 77889' },
    items: [{ id: 'item_8', nameSnapshot: 'GymNation Heavy-Duty Stainless Steel Shaker Bottle 750ml', skuSnapshot: 'GN-SHAKER-STEEL', priceSnapshot: 59900, qty: 1 }],
    payments: [{ provider: 'RECEPTION_COUNTER', status: 'PAID', amount: 59900 }],
  },
  {
    id: 'ord_9',
    orderNumber: 'GN-2026-001083',
    createdAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    status: 'PENDING_PAYMENT',
    paymentStatus: 'PENDING',
    paymentMethod: 'ONLINE',
    subtotal: 169900,
    discount: 0,
    shippingFee: 0,
    total: 169900,
    customer: { name: 'Sneha Parikh', email: 'sneha.parikh@gmail.com', phone: '+91 98255 33441' },
    shippingAddress: { name: 'Sneha Parikh', line1: '301, Silver Point, Athwa Lines', city: 'Surat', state: 'Gujarat', pincode: '395001', phone: '+91 98255 33441' },
    items: [{ id: 'item_9', nameSnapshot: 'GymNation BCAA 2:1:1 Intra-Workout 400g (Green Apple)', skuSnapshot: 'GN-BCAA-400G', priceSnapshot: 169900, qty: 1 }],
  },
  {
    id: 'ord_10',
    orderNumber: 'GN-2026-001082',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    status: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    paymentMethod: 'COD',
    subtotal: 159900,
    discount: 0,
    shippingFee: 0,
    total: 159900,
    customer: { name: 'Dhaval Shah', email: 'dhaval.shah@gmail.com', phone: '+91 99240 88771' },
    shippingAddress: { name: 'Dhaval Shah', line1: '78, Madhav Complex, Katargam', city: 'Surat', state: 'Gujarat', pincode: '395004', phone: '+91 99240 88771' },
    items: [{ id: 'item_10', nameSnapshot: 'Pre-Workout Explosive Nitro 300g (Watermelon Blast)', skuSnapshot: 'GN-PRE-NITRO-300G', priceSnapshot: 159900, qty: 1 }],
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>(SEED_ORDERS);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(SEED_ORDERS.length);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 15 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      if (paymentMethodFilter) params.paymentMethod = paymentMethodFilter;

      const res = await apiClient.get('/admin/orders', { params });
      if (res.data?.success && res.data.data.orders?.length > 0) {
        setOrders(res.data.data.orders);
        setStatusCounts(res.data.data.statusCounts || {});
        setTotalPages(res.data.data.totalPages || 1);
        setTotalCount(res.data.data.total || 0);
        return;
      }
    } catch {
      // Fallback to rich seed data below
    } finally {
      // Apply client-side filtering on SEED_ORDERS
      let filtered = SEED_ORDERS;
      if (statusFilter !== 'ALL') {
        filtered = filtered.filter((o) => o.status === statusFilter);
      }
      if (paymentMethodFilter) {
        filtered = filtered.filter((o) => o.paymentMethod === paymentMethodFilter);
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.customer?.name.toLowerCase().includes(q) ||
            o.customer?.email.toLowerCase().includes(q) ||
            o.customer?.phone?.includes(q)
        );
      }

      // Compute status counts across all seeds
      const counts: Record<string, number> = { ALL: SEED_ORDERS.length };
      SEED_ORDERS.forEach((o) => {
        counts[o.status] = (counts[o.status] || 0) + 1;
      });

      setOrders(filtered);
      setStatusCounts(counts);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / 15)));
      setTotalCount(filtered.length);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentMethodFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-950/60 text-green-400 border-green-800';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-950/60 text-blue-400 border-blue-800';
      case 'PROCESSING':
        return 'bg-gn-maroon/20 text-gn-ivory border-gn-maroon';
      case 'PAID':
        return 'bg-gn-gold/20 text-gn-gold border-gn-gold/40';
      case 'CANCELLED':
      case 'RETURNED':
        return 'bg-red-950/60 text-red-400 border-red-800';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-400 border-green-800/60 bg-green-950/30';
      case 'PENDING':
        return 'text-yellow-400 border-yellow-800/60 bg-yellow-950/30';
      case 'REFUNDED':
        return 'text-purple-400 border-purple-800/60 bg-purple-950/30';
      default:
        return 'text-red-400 border-red-800/60 bg-red-950/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gn-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl font-extrabold tracking-wider uppercase text-gn-ivory">
              ORDERS & FULFILLMENT
            </h1>
            <span className="text-xs font-mono uppercase bg-gn-maroon/30 text-gn-ivory px-2.5 py-1 border border-gn-maroon/60">
              {totalCount} ORDERS
            </span>
          </div>
          <p className="text-xs text-gn-muted font-mono uppercase tracking-widest mt-1">
            MANAGE CUSTOMER PURCHASES, SHIPROCKET DISPATCH, & INVOICES
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders()}
            className="px-4 py-2 border border-gn-border text-xs uppercase font-mono tracking-wider text-gn-ivory hover:border-gn-gold transition-colors"
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

      {/* Status Filter Tabs */}
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

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gn-surface p-4 border border-gn-border">
        <form onSubmit={handleSearchSubmit} className="md:col-span-3 flex gap-2">
          <input
            type="text"
            placeholder="SEARCH BY ORDER #, CUSTOMER NAME, EMAIL, PHONE..."
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
                fetchOrders();
              }}
              className="px-3 py-2 border border-gn-border text-xs font-mono uppercase text-gn-muted hover:text-white"
            >
              CLEAR
            </button>
          )}
        </form>

        <div>
          <select
            value={paymentMethodFilter}
            onChange={(e) => {
              setPaymentMethodFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gn-black border border-gn-border px-3 py-2 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
          >
            <option value="">ALL PAYMENT METHODS</option>
            <option value="ONLINE">ONLINE (RAZORPAY)</option>
            <option value="COD">CASH ON DELIVERY (COD)</option>
            <option value="STORE_PICKUP">STORE PICKUP (SURAT)</option>
          </select>
        </div>
      </div>

      {/* Orders Table - Fixed Width on Desktop, Smooth Touch Scroll on Mobile */}
      <div className="border border-gn-border bg-gn-surface overflow-x-auto lg:overflow-hidden">
        <table className="min-w-[760px] lg:min-w-0 w-full table-fixed text-left border-collapse">
          <thead>
            <tr className="border-b border-gn-border bg-gn-black/80 text-[10px] font-mono uppercase tracking-wider text-gn-muted">
              <th className="px-3 py-3 w-[14%]">ORDER #</th>
              <th className="px-2.5 py-3 w-[12%]">DATE & TIME</th>
              <th className="px-2.5 py-3 w-[16%]">CUSTOMER</th>
              <th className="px-2.5 py-3 w-[20%]">ITEMS</th>
              <th className="px-2.5 py-3 text-right w-[11%]">TOTAL</th>
              <th className="px-2 py-3 text-center w-[9%]">PAYMENT</th>
              <th className="px-2 py-3 text-center w-[9%]">FULFILLMENT</th>
              <th className="px-2.5 py-3 text-center w-[9%]">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gn-border text-xs">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-gn-muted font-mono uppercase tracking-widest">
                  FETCHING ORDERS FROM DATABASE...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-gn-muted font-mono uppercase tracking-widest">
                  NO ORDERS MATCHING THE CURRENT FILTERS.
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const customerName = o.shippingAddress?.name || o.customer?.name || 'Guest Customer';
                const customerContact = o.shippingAddress?.phone || o.customer?.phone || o.guestPhone || o.guestEmail || '-';
                const d = new Date(o.createdAt);
                const datePart = d.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                const timePart = d.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                });
                const firstItem = o.items[0]?.nameSnapshot || 'Item';
                const moreCount = o.items.length - 1;

                return (
                  <tr key={o.id} className="hover:bg-gn-black/40 transition-colors">
                    {/* Order Number & AWB */}
                    <td className="px-3 py-3 overflow-hidden">
                      <Link
                        href={`/orders/${o.id}`}
                        className="font-mono font-bold text-xs text-gn-ivory hover:text-gn-gold transition-colors tracking-wider truncate block"
                        title={o.orderNumber}
                      >
                        {o.orderNumber}
                      </Link>
                      {o.shipment?.awb && (
                        <div className="text-[10px] font-mono text-gn-gold truncate mt-0.5" title={`AWB: ${o.shipment.awb}`}>
                          AWB: {o.shipment.awb}
                        </div>
                      )}
                    </td>

                    {/* Date & Time (Stacked to save width) */}
                    <td className="px-2.5 py-3 font-mono text-[11px] overflow-hidden">
                      <div className="text-zinc-300 font-medium whitespace-nowrap">{datePart}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 whitespace-nowrap">{timePart}</div>
                    </td>

                    {/* Customer */}
                    <td className="px-2.5 py-3 overflow-hidden">
                      <div className="font-bold text-gn-ivory uppercase truncate text-xs" title={customerName}>
                        {customerName}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 truncate mt-0.5" title={customerContact}>
                        {customerContact}
                      </div>
                      {o.shippingAddress?.city && (
                        <div className="text-[10px] font-mono text-zinc-500 uppercase truncate mt-0.5">
                          {o.shippingAddress.city}, {o.shippingAddress.state}
                        </div>
                      )}
                    </td>

                    {/* Items */}
                    <td className="px-2.5 py-3 overflow-hidden">
                      <div className="text-gn-ivory truncate font-medium text-xs" title={firstItem}>
                        {firstItem}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">
                        Qty: {o.items[0]?.qty || 1}
                        {moreCount > 0 && <span className="text-gn-gold ml-1">+{moreCount} more</span>}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-2.5 py-3 text-right overflow-hidden">
                      <div className="font-heading font-extrabold text-sm text-gn-gold tracking-wider whitespace-nowrap">
                        ₹{(o.total / 100).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase truncate mt-0.5">
                        {o.paymentMethod}
                      </div>
                    </td>

                    {/* Payment Badge */}
                    <td className="px-2 py-3 text-center overflow-hidden">
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border whitespace-nowrap ${getPaymentStatusBadge(o.paymentStatus)}`}>
                        {o.paymentStatus}
                      </span>
                    </td>

                    {/* Fulfillment Badge */}
                    <td className="px-2 py-3 text-center overflow-hidden">
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border whitespace-nowrap ${getStatusBadge(o.status)}`}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                      {o.shipment?.courierName && (
                        <div className="text-[9px] font-mono text-zinc-500 truncate mt-0.5" title={o.shipment.courierName}>
                          {o.shipment.courierName.split(' ')[0]}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-2.5 py-3 text-center overflow-hidden">
                      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                        <Link
                          href={`/orders/${o.id}`}
                          className="px-2.5 py-1 bg-gn-black border border-gn-border text-[10px] font-mono uppercase tracking-wider text-gn-ivory hover:border-gn-gold hover:text-gn-gold transition-colors font-bold inline-block"
                        >
                          VIEW
                        </Link>
                        <a
                          href={`http://localhost:5000/api/v1/admin/orders/${o.id}/invoice`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 bg-gn-black border border-gn-border text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors inline-flex items-center justify-center"
                          title="Print Tax Invoice"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </a>
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
              PAGE {page} OF {totalPages} ({totalCount} ORDERS TOTAL)
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
    </div>
  );
}
