'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../lib/api';

interface OrderDetail {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  couponCode?: string | null;
  notes?: string | null;
  invoiceNumber?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  shippingAddress: any;
  billingAddress: any;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  items: Array<{
    id: string;
    variantId?: string | null;
    nameSnapshot: string;
    skuSnapshot: string;
    priceSnapshot: number;
    qty: number;
    gstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    variant?: {
      id: string;
      label: string;
      stock: number;
      product?: {
        id: string;
        name: string;
        slug: string;
        images?: any;
      } | null;
    } | null;
  }>;
  shipment?: {
    id: string;
    shiprocketOrderId?: string | null;
    shipmentId?: string | null;
    awb?: string | null;
    courierName?: string | null;
    status: string;
    trackingUrl?: string | null;
    labelUrl?: string | null;
    manifestUrl?: string | null;
    pickupScheduledAt?: string | null;
  } | null;
  payments: Array<{
    id: string;
    provider: string;
    status: string;
    amount: number;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    refundId?: string | null;
    refundAmount?: number | null;
    createdAt: string;
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal & Form States
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const [showShipModal, setShowShipModal] = useState(false);
  const [packageWeight, setPackageWeight] = useState('1.2');
  const [dispatching, setDispatching] = useState(false);

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [restoreStockOnRefund, setRestoreStockOnRefund] = useState(true);
  const [processingRefund, setProcessingRefund] = useState(false);

  const [schedulingPickup, setSchedulingPickup] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/orders/${id}`);
      if (res.data?.success) {
        setOrder(res.data.data);
        setSelectedStatus(res.data.data.status);
        setRefundAmount((res.data.data.total / 100).toString());
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load order detail' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrderDetail();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      const res = await apiClient.patch(`/admin/orders/${id}/status`, {
        status: selectedStatus,
        notes: statusNote.trim() || undefined,
      });
      if (res.data?.success) {
        setFeedback({ type: 'success', message: `Order status updated to ${selectedStatus}` });
        setShowStatusModal(false);
        setStatusNote('');
        fetchOrderDetail();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update order status' });
    }
  };

  const handleDispatchShiprocket = async () => {
    try {
      setDispatching(true);
      const res = await apiClient.post(`/admin/orders/${id}/shiprocket`, {
        weightKg: parseFloat(packageWeight) || 1.2,
      });
      if (res.data?.success) {
        setFeedback({
          type: 'success',
          message: `Shiprocket order dispatched! AWB: ${res.data.data.shipment.awb} via ${res.data.data.shipment.courierName}`,
        });
        setShowShipModal(false);
        fetchOrderDetail();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to dispatch via Shiprocket' });
    } finally {
      setDispatching(false);
    }
  };

  const handleSchedulePickup = async () => {
    try {
      setSchedulingPickup(true);
      const res = await apiClient.post(`/admin/orders/${id}/pickup`);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: res.data.message });
        fetchOrderDetail();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to schedule pickup' });
    } finally {
      setSchedulingPickup(false);
    }
  };

  const handleProcessRefund = async () => {
    try {
      setProcessingRefund(true);
      const res = await apiClient.post(`/admin/orders/${id}/refund`, {
        amountPaise: Math.round(parseFloat(refundAmount) * 100),
        reason: refundReason,
        restoreStock: restoreStockOnRefund,
      });
      if (res.data?.success) {
        setFeedback({ type: 'success', message: res.data.message });
        setShowRefundModal(false);
        fetchOrderDetail();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Refund processing failed' });
    } finally {
      setProcessingRefund(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setSubmittingNote(true);
      const res = await apiClient.post(`/admin/orders/${id}/notes`, {
        note: newNote.trim(),
      });
      if (res.data?.success) {
        setFeedback({ type: 'success', message: 'Note added to order' });
        setNewNote('');
        fetchOrderDetail();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add note' });
    } finally {
      setSubmittingNote(false);
    }
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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-gn-muted">
          LOADING ORDER DETAILS...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 border border-gn-border bg-gn-surface text-center">
        <div className="font-heading text-2xl uppercase text-gn-ivory mb-2">ORDER NOT FOUND</div>
        <p className="text-xs text-gn-muted font-mono uppercase mb-4">
          THE SPECIFIED ORDER IDENTIFIER DOES NOT EXIST IN THE DATABASE.
        </p>
        <Link
          href="/orders"
          className="px-4 py-2 bg-gn-maroon text-gn-ivory text-xs font-mono uppercase tracking-wider inline-block"
        >
          BACK TO ALL ORDERS
        </Link>
      </div>
    );
  }

  const shipping = order.shippingAddress || {};
  const billing = order.billingAddress || shipping;
  const isGujarat = (shipping.state || '').toLowerCase().includes('gujarat');

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="text-xs font-mono uppercase tracking-wider text-gn-muted hover:text-gn-gold flex items-center gap-1 transition-colors"
        >
          <span>&larr;</span>
          <span>BACK TO ALL ORDERS</span>
        </Link>

        <span className="text-[11px] font-mono uppercase text-zinc-500">
          ORDER ID: {order.id}
        </span>
      </div>

      {/* Main Order Header Bar */}
      <div className="bg-gn-surface border border-gn-border p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-extrabold tracking-wider uppercase text-gn-ivory">
              {order.orderNumber}
            </h1>
            <span className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
              {order.status.replace(/_/g, ' ')}
            </span>
            <span className="px-3 py-1 text-xs font-mono uppercase tracking-wider border border-green-800 text-green-400 bg-green-950/40">
              PAYMENT: {order.paymentStatus}
            </span>
            <span className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border border-gn-border text-zinc-400 bg-gn-black">
              {order.paymentMethod}
            </span>
          </div>
          <div className="text-xs font-mono uppercase text-gn-muted tracking-wider mt-2 flex flex-wrap items-center gap-3">
            <span>
              PLACED ON:{' '}
              {new Date(order.createdAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span>&bull;</span>
            <span>CUSTOMER: {shipping.name || order.customer?.name || 'GUEST'}</span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`http://localhost:5000/api/v1/admin/orders/${order.id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gn-black border border-gn-border text-xs font-mono uppercase tracking-wider text-gn-ivory hover:border-gn-gold hover:text-gn-gold transition-colors"
          >
            PRINT GST INVOICE
          </a>

          <button
            onClick={() => setShowStatusModal(true)}
            className="px-4 py-2 bg-gn-surface border border-gn-border text-xs font-mono uppercase tracking-wider text-gn-ivory hover:border-gn-gold transition-colors"
          >
            CHANGE STATUS
          </button>

          {!order.shipment?.awb && order.status !== 'CANCELLED' && (
            <button
              onClick={() => setShowShipModal(true)}
              className="px-5 py-2 bg-gn-maroon hover:bg-gn-maroon/80 text-gn-ivory font-heading font-bold text-sm tracking-wider uppercase transition-colors"
            >
              SHIP VIA SHIPROCKET
            </button>
          )}

          {order.shipment?.awb && !order.shipment.pickupScheduledAt && (
            <button
              onClick={handleSchedulePickup}
              disabled={schedulingPickup}
              className="px-4 py-2 bg-gn-maroon hover:bg-gn-maroon/80 text-gn-ivory text-xs font-mono uppercase tracking-wider disabled:opacity-50"
            >
              {schedulingPickup ? 'SCHEDULING...' : 'SCHEDULE PICKUP'}
            </button>
          )}

          {order.paymentStatus === 'PAID' && order.status !== 'REFUNDED' && (
            <button
              onClick={() => setShowRefundModal(true)}
              className="px-4 py-2 bg-gn-black border border-red-900/60 text-xs font-mono uppercase tracking-wider text-red-400 hover:border-red-600 transition-colors"
            >
              REFUND
            </button>
          )}
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

      {/* Main Grid: Left Details & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ordered Line Items */}
          <div className="bg-gn-surface border border-gn-border p-6">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-gn-ivory border-b border-gn-border pb-3 mb-4">
              ORDER ITEMS ({order.items.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gn-border text-[11px] font-mono uppercase tracking-widest text-gn-muted">
                    <th className="pb-3">PRODUCT</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3 text-center">QTY</th>
                    <th className="pb-3 text-right">UNIT PRICE</th>
                    <th className="pb-3 text-right">GST</th>
                    <th className="pb-3 text-right">LINE TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gn-border text-xs">
                  {order.items.map((it) => {
                    const lineTotal = (it.priceSnapshot * it.qty) / 100;
                    const gstAmount = isGujarat
                      ? (it.cgstAmount + it.sgstAmount) / 100
                      : it.igstAmount / 100;

                    return (
                      <tr key={it.id} className="hover:bg-gn-black/30">
                        <td className="py-4 pr-3">
                          <div className="font-semibold text-gn-ivory uppercase">
                            {it.nameSnapshot}
                          </div>
                          {it.variant?.label && (
                            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                              Variant: {it.variant.label}
                            </div>
                          )}
                        </td>

                        <td className="py-4 font-mono text-[11px] text-zinc-400">
                          {it.skuSnapshot}
                        </td>

                        <td className="py-4 text-center font-mono font-bold text-gn-ivory">
                          {it.qty}
                        </td>

                        <td className="py-4 text-right font-mono text-zinc-300">
                          ₹{(it.priceSnapshot / 100).toLocaleString('en-IN')}
                        </td>

                        <td className="py-4 text-right font-mono text-zinc-400 text-[11px]">
                          ₹{gstAmount.toFixed(2)} ({it.gstRate}%)
                        </td>

                        <td className="py-4 text-right font-heading font-extrabold text-base text-gn-gold">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Breakdown */}
            <div className="mt-6 pt-6 border-t border-gn-border flex justify-end">
              <div className="w-full max-w-sm space-y-2 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span className="uppercase">SUBTOTAL:</span>
                  <span>₹{(order.subtotal / 100).toLocaleString('en-IN')}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-gn-maroon">
                    <span className="uppercase">DISCOUNT ({order.couponCode || 'COUPON'}):</span>
                    <span>-₹{(order.discount / 100).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-400">
                  <span className="uppercase">SHIPPING FEE:</span>
                  <span>
                    {order.shippingFee === 0 ? 'FREE' : `₹${(order.shippingFee / 100).toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400 border-b border-gn-border pb-2">
                  <span className="uppercase">TOTAL GST INCLUDED:</span>
                  <span>₹{(order.taxAmount / 100).toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-heading font-extrabold text-xl text-gn-gold pt-2">
                  <span className="uppercase tracking-wider">GRAND TOTAL:</span>
                  <span>₹{(order.total / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="bg-gn-surface border border-gn-border p-6">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-gn-ivory border-b border-gn-border pb-3 mb-4">
              PAYMENT TRANSACTIONS ({order.payments.length})
            </h2>

            {order.payments.length === 0 ? (
              <div className="text-xs font-mono uppercase text-zinc-500 py-4">
                NO PAYMENT ATTEMPTS LOGGED YET.
              </div>
            ) : (
              <div className="space-y-4">
                {order.payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-gn-black border border-gn-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gn-ivory uppercase">{p.provider}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase border ${
                            p.status === 'PAID' || p.status === 'CAPTURED'
                              ? 'border-green-800 text-green-400 bg-green-950/30'
                              : p.status === 'REFUNDED'
                              ? 'border-purple-800 text-purple-400 bg-purple-950/30'
                              : 'border-yellow-800 text-yellow-400 bg-yellow-950/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      {p.razorpayPaymentId && (
                        <div className="text-zinc-400 text-[11px] mt-1">
                          Payment ID: <span className="text-zinc-200">{p.razorpayPaymentId}</span>
                        </div>
                      )}
                      {p.refundId && (
                        <div className="text-purple-400 text-[11px] mt-1">
                          Refund ID: {p.refundId} (₹{((p.refundAmount || p.amount) / 100).toFixed(2)})
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="font-heading font-extrabold text-lg text-gn-gold">
                        ₹{(p.amount / 100).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {new Date(p.createdAt).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Internal Notes & Timeline */}
          <div className="bg-gn-surface border border-gn-border p-6 space-y-4">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-gn-ivory border-b border-gn-border pb-3">
              INTERNAL OPERATIONAL NOTES & AUDIT
            </h2>

            {order.notes ? (
              <pre className="p-4 bg-gn-black border border-gn-border text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {order.notes}
              </pre>
            ) : (
              <div className="text-xs font-mono uppercase text-zinc-500">NO NOTES ATTACHED YET.</div>
            )}

            <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="ADD INTERNAL NOTE FOR THIS ORDER (VISIBLE TO STAFF ONLY)..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 bg-gn-black border border-gn-border px-3 py-2 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
              />
              <button
                type="submit"
                disabled={submittingNote || !newNote.trim()}
                className="px-5 py-2 bg-gn-maroon text-gn-ivory text-xs font-mono uppercase tracking-wider hover:bg-gn-maroon/80 disabled:opacity-40"
              >
                {submittingNote ? 'SAVING...' : 'ADD NOTE'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (1 span) */}
        <div className="space-y-6">
          {/* Shiprocket Fulfillment Card */}
          <div className="bg-gn-surface border border-gn-border p-6">
            <div className="flex items-center justify-between border-b border-gn-border pb-3 mb-4">
              <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-gn-ivory">
                SHIPROCKET DISPATCH
              </h2>
              {order.shipment?.awb && (
                <span className="text-[10px] font-mono uppercase bg-blue-950/60 text-blue-400 border border-blue-800 px-2 py-0.5">
                  {order.shipment.status}
                </span>
              )}
            </div>

            {order.shipment?.awb ? (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 bg-gn-black border border-gn-border space-y-2">
                  <div className="text-zinc-500 uppercase text-[10px]">COURIER PARTNER:</div>
                  <div className="font-bold text-gn-ivory text-sm uppercase">
                    {order.shipment.courierName || 'Delhivery Surface'}
                  </div>

                  <div className="text-zinc-500 uppercase text-[10px] pt-1">AWB NUMBER:</div>
                  <div className="font-bold text-gn-gold font-mono tracking-wider">
                    {order.shipment.awb}
                  </div>

                  {order.shipment.trackingUrl && (
                    <div className="pt-2">
                      <a
                        href={order.shipment.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gn-gold hover:underline inline-block uppercase"
                      >
                        VIEW LIVE TRACKING &rarr;
                      </a>
                    </div>
                  )}
                </div>

                {order.shipment.pickupScheduledAt ? (
                  <div className="p-3 bg-green-950/30 border border-green-800 text-green-300 text-[11px]">
                    PICKUP SCHEDULED FOR:{' '}
                    <strong>
                      {new Date(order.shipment.pickupScheduledAt).toLocaleString('en-IN')}
                    </strong>
                  </div>
                ) : (
                  <button
                    onClick={handleSchedulePickup}
                    disabled={schedulingPickup}
                    className="w-full py-2.5 bg-gn-maroon hover:bg-gn-maroon/80 text-gn-ivory font-heading font-bold text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {schedulingPickup ? 'SCHEDULING PICKUP...' : 'SCHEDULE COURIER PICKUP'}
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {order.shipment.labelUrl && (
                    <a
                      href={order.shipment.labelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center py-2 bg-gn-black border border-gn-border text-zinc-300 hover:border-gn-gold text-[11px] uppercase"
                    >
                      PRINT LABEL
                    </a>
                  )}
                  {order.shipment.manifestUrl && (
                    <a
                      href={order.shipment.manifestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center py-2 bg-gn-black border border-gn-border text-zinc-300 hover:border-gn-gold text-[11px] uppercase"
                    >
                      MANIFEST
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-mono">
                <p className="text-zinc-400 uppercase leading-relaxed">
                  THIS ORDER HAS NOT BEEN DISPATCHED TO SHIPROCKET YET.
                </p>
                <button
                  onClick={() => setShowShipModal(true)}
                  disabled={order.status === 'CANCELLED'}
                  className="w-full py-3 bg-gn-maroon hover:bg-gn-maroon/80 text-gn-ivory font-heading font-bold text-sm uppercase tracking-wider transition-colors disabled:opacity-40"
                >
                  DISPATCH VIA SHIPROCKET &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Customer Details Card */}
          <div className="bg-gn-surface border border-gn-border p-6 text-xs font-mono space-y-3">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-gn-ivory border-b border-gn-border pb-3">
              CUSTOMER PROFILE
            </h2>

            <div>
              <div className="text-zinc-500 uppercase text-[10px]">NAME:</div>
              <div className="font-bold text-gn-ivory uppercase">
                {shipping.name || order.customer?.name || 'GUEST USER'}
              </div>
            </div>

            <div>
              <div className="text-zinc-500 uppercase text-[10px]">EMAIL:</div>
              <div className="text-zinc-300">{order.guestEmail || order.customer?.email || '-'}</div>
            </div>

            <div>
              <div className="text-zinc-500 uppercase text-[10px]">PHONE:</div>
              <div className="text-zinc-300">{shipping.phone || order.guestPhone || order.customer?.phone || '-'}</div>
            </div>

            <div className="pt-2 border-t border-gn-border">
              <span className="text-[10px] uppercase px-2 py-0.5 border border-gn-border bg-gn-black text-gn-gold">
                {order.customer ? 'REGISTERED ACCOUNT' : 'GUEST CHECKOUT'}
              </span>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-gn-surface border border-gn-border p-6 text-xs font-mono space-y-2">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-gn-ivory border-b border-gn-border pb-3">
              SHIPPING ADDRESS
            </h2>

            <div className="text-gn-ivory font-bold uppercase">{shipping.name}</div>
            <div className="text-zinc-300">{shipping.line1}</div>
            {shipping.line2 && <div className="text-zinc-300">{shipping.line2}</div>}
            <div className="text-zinc-300">
              {shipping.city}, {shipping.state} - {shipping.pincode}
            </div>
            <div className="text-zinc-400">{shipping.country || 'India'}</div>
            <div className="text-zinc-400 pt-1">Phone: {shipping.phone}</div>
          </div>

          {/* Billing Address Card */}
          <div className="bg-gn-surface border border-gn-border p-6 text-xs font-mono space-y-2">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-gn-ivory border-b border-gn-border pb-3">
              BILLING ADDRESS
            </h2>

            <div className="text-gn-ivory font-bold uppercase">{billing.name}</div>
            <div className="text-zinc-300">{billing.line1}</div>
            {billing.line2 && <div className="text-zinc-300">{billing.line2}</div>}
            <div className="text-zinc-300">
              {billing.city}, {billing.state} - {billing.pincode}
            </div>
            <div className="text-zinc-400">{billing.country || 'India'}</div>
            <div className="text-zinc-400 pt-1">Phone: {billing.phone}</div>
          </div>
        </div>
      </div>

      {/* MODAL 1: CHANGE STATUS */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border p-6 max-w-md w-full space-y-4">
            <h3 className="font-heading text-xl font-bold uppercase text-gn-ivory">
              UPDATE ORDER STATUS
            </h3>

            <div>
              <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                SELECT NEW STATUS
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
              >
                <option value="PAID">PAID</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED (RESTORES STOCK)</option>
                <option value="RETURNED">RETURNED</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                REASON / OPERATIONAL NOTE
              </label>
              <input
                type="text"
                placeholder="E.G. HANDED OVER TO COURIER / CUSTOMER REQUEST"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gn-border text-xs font-mono uppercase text-zinc-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="px-5 py-2 bg-gn-maroon text-gn-ivory font-heading font-bold text-sm uppercase tracking-wider hover:bg-gn-maroon/80"
              >
                UPDATE STATUS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SHIPROCKET DISPATCH */}
      {showShipModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border p-6 max-w-md w-full space-y-4">
            <h3 className="font-heading text-xl font-bold uppercase text-gn-ivory">
              DISPATCH VIA SHIPROCKET
            </h3>

            <div className="text-xs font-mono text-zinc-400 space-y-1">
              <div>ORDER: <strong>{order.orderNumber}</strong></div>
              <div>DESTINATION PINCODE: <strong>{shipping.pincode}</strong> ({shipping.city})</div>
              <div>PAYMENT METHOD: <strong>{order.paymentMethod}</strong></div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                PACKAGE WEIGHT (IN KG)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={packageWeight}
                onChange={(e) => setPackageWeight(e.target.value)}
                className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono text-gn-ivory focus:outline-none focus:border-gn-gold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowShipModal(false)}
                className="px-4 py-2 border border-gn-border text-xs font-mono uppercase text-zinc-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={dispatching}
                onClick={handleDispatchShiprocket}
                className="px-5 py-2 bg-gn-maroon text-gn-ivory font-heading font-bold text-sm uppercase tracking-wider hover:bg-gn-maroon/80 disabled:opacity-40"
              >
                {dispatching ? 'CREATING SHIPMENT...' : 'DISPATCH NOW'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PROCESS REFUND */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border p-6 max-w-md w-full space-y-4">
            <h3 className="font-heading text-xl font-bold uppercase text-gn-ivory">
              PROCESS RAZORPAY REFUND
            </h3>

            <div>
              <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                REFUND AMOUNT (₹)
              </label>
              <input
                type="number"
                step="1"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono text-gn-ivory focus:outline-none focus:border-gn-gold"
              />
              <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                MAX REFUNDABLE: ₹{(order.total / 100).toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                REASON FOR REFUND
              </label>
              <input
                type="text"
                placeholder="E.G. CUSTOMER CANCELLED / OUT OF STOCK"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full bg-gn-black border border-gn-border p-2.5 text-xs font-mono uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="restoreStockCheck"
                checked={restoreStockOnRefund}
                onChange={(e) => setRestoreStockOnRefund(e.target.checked)}
                className="h-4 w-4 bg-gn-black border border-gn-border rounded-none"
              />
              <label htmlFor="restoreStockCheck" className="text-xs font-mono uppercase text-zinc-300">
                RESTORE INVENTORY STOCK FOR ORDER ITEMS
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 border border-gn-border text-xs font-mono uppercase text-zinc-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={processingRefund || !refundReason.trim()}
                onClick={handleProcessRefund}
                className="px-5 py-2 bg-gn-maroon text-gn-ivory font-heading font-bold text-sm uppercase tracking-wider hover:bg-gn-maroon/80 disabled:opacity-40"
              >
                {processingRefund ? 'PROCESSING REFUND...' : 'CONFIRM REFUND'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
