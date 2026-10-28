'use client';

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { apiClient } from '../../lib/api';
import { CloseIcon, CheckIcon } from '../common/Icons';
import { validateName, validateIndianPhone, validateEmail, validatePincode, sanitizeInput } from '../../lib/validation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutModal: React.FC = () => {
  const { items, subtotalPaise, isCheckoutOpen, setIsCheckoutOpen, clearCart } = useCart();

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('Surat');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('395009');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD' | 'STORE_PICKUP'>('ONLINE');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const isSurat = pincode.startsWith('395');
  const discountPaise = appliedCoupon ? appliedCoupon.discountPaise : 0;
  const shippingFeePaise = paymentMethod === 'STORE_PICKUP' || (subtotalPaise - discountPaise) >= 99900 ? 0 : 9900;
  const grandTotalPaise = Math.max(0, subtotalPaise - discountPaise + shippingFeePaise);

  const handleApplyCoupon = async () => {
    const cleanCoupon = sanitizeInput(couponCode).toUpperCase();
    if (!cleanCoupon) return;
    try {
      setCouponError(null);
      const res = await apiClient.post('/coupons/apply', {
        code: cleanCoupon,
        cartSubtotalPaise: subtotalPaise,
      });
      if (res.data?.success) {
        setAppliedCoupon(res.data.data);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid or expired promo coupon');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 0. Ensure cart has items
    if (!items || items.length === 0) {
      setError('Your cart is empty. Add products before checking out.');
      return;
    }

    // 1. Validate recipient name
    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      setError(nameCheck.error || 'Please enter recipient name.');
      return;
    }

    // 2. Validate phone number
    const phoneCheck = validateIndianPhone(phone);
    if (!phoneCheck.isValid) {
      setError(phoneCheck.error || 'Please enter a valid 10-digit phone number.');
      return;
    }

    // 3. Validate email
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    // 4. Validate address line 1
    const cleanLine1 = sanitizeInput(line1);
    if (!cleanLine1 || cleanLine1.length < 3) {
      setError('Please provide a complete delivery street address (minimum 3 characters).');
      return;
    }

    // 5. Validate PIN code
    const pinCheck = validatePincode(pincode);
    if (!pinCheck.isValid) {
      setError(pinCheck.error || 'Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const cleanName = sanitizeInput(name);
      const cleanEmail = sanitizeInput(email).toLowerCase();
      const cleanCity = sanitizeInput(city);
      const cleanState = sanitizeInput(state);
      const cleanPin = pincode.trim().replace(/\D/g, '');

      const orderPayload = {
        guestEmail: cleanEmail,
        guestPhone: phoneCheck.cleanPhone,
        shippingAddress: {
          name: cleanName,
          phone: phoneCheck.cleanPhone,
          line1: cleanLine1,
          city: cleanCity,
          state: cleanState,
          pincode: cleanPin,
          country: 'India',
        },
        billingAddress: {
          name: cleanName,
          phone: phoneCheck.cleanPhone,
          line1: cleanLine1,
          city: cleanCity,
          state: cleanState,
          pincode: cleanPin,
          country: 'India',
        },
        items: items.map((it) => ({
          variantId: it.id,
          qty: Math.max(1, Math.floor(it.qty)),
        })),
        couponCode: appliedCoupon?.code ? sanitizeInput(appliedCoupon.code) : undefined,
        paymentMethod,
      };

      const res = await apiClient.post('/checkout/create-order', orderPayload);
      if (!res.data?.success) throw new Error(res.data?.message || 'Failed to initialize order');

      const { order, razorpayOrder, keyId } = res.data.data;

      if (paymentMethod === 'COD' || paymentMethod === 'STORE_PICKUP') {
        setConfirmedOrder(order);
        clearCart();
        return;
      }

      // Online Razorpay Flow
      if (!window.Razorpay) {
        // Fallback simulated payment verification for local development
        const verifyRes = await apiClient.post('/checkout/verify-payment', {
          orderId: order.id,
          razorpayOrderId: razorpayOrder.id,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: 'sig_sim_demo',
        });
        if (verifyRes.data?.success) {
          setConfirmedOrder(verifyRes.data.data.order);
          clearCart();
        }
        return;
      }

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'GymNation – The Fitness Hub',
        description: `Order: ${order.orderNumber}`,
        image: '/gymnationlogo.png',
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await apiClient.post('/checkout/verify-payment', {
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verifyRes.data?.success) {
              setConfirmedOrder(verifyRes.data.data.order);
              clearCart();
            }
          } catch (verr: any) {
            setError('Payment verification error: ' + verr.message);
          }
        },
        prefill: { name, email, contact: phone },
        theme: { color: '#7A1F25' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gn-surface border border-gn-border my-8 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gn-border pb-4">
          <div>
            <h3 className="font-heading text-2xl font-bold uppercase tracking-wider text-gn-ivory">
              SECURE CHECKOUT & FULFILLMENT
            </h3>
            <span className="text-[11px] font-mono uppercase text-gn-gold">
              100% AUTHENTIC SUPPLEMENTS DIRECT FROM SURAT HUB
            </span>
          </div>
          <button onClick={() => setIsCheckoutOpen(false)} className="p-1 text-zinc-400 hover:text-white">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          <div className="text-center py-10 space-y-4 font-mono">
            <div className="w-14 h-14 bg-green-950/40 border border-green-800 text-green-400 mx-auto flex items-center justify-center">
              <CheckIcon className="w-8 h-8" />
            </div>
            <h4 className="font-heading text-3xl font-bold uppercase text-gn-ivory">
              ORDER CONFIRMED!
            </h4>
            <div className="text-sm text-gn-gold font-bold">
              ORDER NUMBER: {confirmedOrder.orderNumber}
            </div>
            <p className="text-xs text-zinc-300 max-w-md mx-auto uppercase leading-relaxed">
              THANK YOU, {confirmedOrder.shippingAddress?.name}! A CONFIRMATION RECEIPT AND
              SHIPROCKET TRACKING DETAILS WILL BE SENT TO {confirmedOrder.guestPhone || confirmedOrder.guestEmail}.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <a
                href={`http://localhost:5000/api/v1/admin/orders/${confirmedOrder.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-gn-black border border-gn-border text-xs text-gn-ivory hover:border-gn-gold uppercase"
              >
                PRINT GST TAX INVOICE
              </a>
              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  setIsCheckoutOpen(false);
                }}
                className="px-6 py-2.5 bg-gn-maroon text-white font-heading font-bold text-xs uppercase"
              >
                BACK TO STORE
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="space-y-6 text-xs font-mono">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 uppercase">
                {error}
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-3">
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest border-b border-gn-border pb-1">
                01. CONTACT INFORMATION
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400 uppercase block mb-1">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. HARSHIL PATEL"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border p-2.5 uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 uppercase block mb-1">PHONE NUMBER *</label>
                  <input
                    type="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    placeholder="9825012345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border p-2.5 text-gn-ivory focus:outline-none focus:border-gn-gold"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 uppercase block mb-1">EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    required
                    placeholder="harshil@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border p-2.5 text-gn-ivory focus:outline-none focus:border-gn-gold"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-3">
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest border-b border-gn-border pb-1">
                02. DELIVERY ADDRESS
              </div>
              <div>
                <label className="text-zinc-400 uppercase block mb-1">FLAT / STREET / LANDMARK *</label>
                <input
                  type="text"
                  required
                  placeholder="B-402, Royal Residency, Near Star Bazaar, Adajan"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="w-full bg-gn-black border border-gn-border p-2.5 text-gn-ivory uppercase focus:outline-none focus:border-gn-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400 uppercase block mb-1">PINCODE *</label>
                  <input
                    type="text"
                    required
                    pattern="[1-9][0-9]{5}"
                    placeholder="395009"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border p-2.5 text-gn-ivory focus:outline-none focus:border-gn-gold"
                  />
                  {isSurat && (
                    <span className="text-[10px] text-gn-gold mt-1 block">
                      SURAT LOCAL (FAST DISPATCH AVAILABLE)
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-zinc-400 uppercase block mb-1">CITY *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border p-2.5 uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 uppercase block mb-1">STATE *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border p-2.5 uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest border-b border-gn-border pb-1">
                03. PAYMENT PREFERENCE
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`p-3 text-left border uppercase font-mono ${
                    paymentMethod === 'ONLINE'
                      ? 'border-gn-gold bg-gn-maroon/20 text-gn-gold'
                      : 'border-gn-border bg-gn-black text-zinc-400'
                  }`}
                >
                  <div className="font-bold text-xs">ONLINE RAZORPAY</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">UPI, Cards, NetBanking</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3 text-left border uppercase font-mono ${
                    paymentMethod === 'COD'
                      ? 'border-gn-gold bg-gn-maroon/20 text-gn-gold'
                      : 'border-gn-border bg-gn-black text-zinc-400'
                  }`}
                >
                  <div className="font-bold text-xs">CASH ON DELIVERY</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Pay upon package arrival</div>
                </button>

                {isSurat && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('STORE_PICKUP')}
                    className={`p-3 text-left border uppercase font-mono ${
                      paymentMethod === 'STORE_PICKUP'
                        ? 'border-gn-gold bg-gn-maroon/20 text-gn-gold'
                        : 'border-gn-border bg-gn-black text-zinc-400'
                    }`}
                  >
                    <div className="font-bold text-xs text-green-400">SURAT STORE PICKUP</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">₹0 shipping fee (Adajan)</div>
                  </button>
                )}
              </div>
            </div>

            {/* Coupon Code Box */}
            <div className="p-3 bg-gn-black border border-gn-border flex gap-2">
              <input
                type="text"
                placeholder="PROMO CODE (E.G. GYMNATION25)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 bg-gn-surface border border-gn-border px-3 py-1.5 uppercase text-gn-ivory focus:outline-none focus:border-gn-gold"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-1.5 bg-gn-maroon hover:bg-gn-maroon/80 text-white uppercase font-bold"
              >
                APPLY
              </button>
            </div>
            {couponError && <div className="text-red-400 text-[11px]">{couponError}</div>}
            {appliedCoupon && (
              <div className="text-green-400 text-[11px]">
                COUPON &ldquo;{appliedCoupon.code}&rdquo; APPLIED! SAVINGS: ₹{(appliedCoupon.discountPaise / 100).toFixed(2)}
              </div>
            )}

            {/* Totals Summary */}
            <div className="p-4 bg-gn-black border border-gn-border space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>SUBTOTAL:</span>
                <span>₹{(subtotalPaise / 100).toLocaleString('en-IN')}</span>
              </div>
              {discountPaise > 0 && (
                <div className="flex justify-between text-gn-maroon">
                  <span>DISCOUNT:</span>
                  <span>-₹{(discountPaise / 100).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>SHIPPING FEE:</span>
                <span>{shippingFeePaise === 0 ? 'FREE' : `₹${shippingFeePaise / 100}`}</span>
              </div>
              <div className="flex justify-between font-heading font-extrabold text-xl text-gn-gold border-t border-gn-border pt-2">
                <span>FINAL PAYABLE:</span>
                <span>₹{(grandTotalPaise / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="w-full py-4 bg-gn-gold hover:bg-yellow-400 text-gn-black font-heading font-extrabold text-base uppercase tracking-wider transition-colors disabled:opacity-50 shadow-xl"
            >
              {submitting ? 'PROCESSING YOUR ORDER...' : 'PLACE ORDER & CONFIRM'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
