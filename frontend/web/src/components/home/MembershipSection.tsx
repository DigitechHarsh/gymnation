'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { CheckIcon, CloseIcon } from '../common/Icons';
import { ScrollReveal } from '../common/ScrollReveal';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  id: string;
  name: string;
  priceRs: number;
  durationLabel: string;
  isPopular?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'cmvqi1edv000mnzxw2oungd2v',
    name: 'MONTHLY',
    priceRs: 2499,
    durationLabel: 'per month',
    features: ['Gym access', 'All equipment', 'Locker access', 'Basic support'],
  },
  {
    id: 'cmvqi1edv000nnzxwa37r24j3',
    name: 'QUARTERLY',
    priceRs: 6499,
    durationLabel: 'for 3 months',
    isPopular: true,
    features: ['Gym access', '1 InBody Scan', 'All equipment', 'Locker access', 'Trainer diet guide', 'Best support'],
  },
  {
    id: 'cmvqi1edv000onzxwz9g4s6u1',
    name: 'HALF-YEARLY',
    priceRs: 11499,
    durationLabel: 'for 6 months',
    features: ['Gym access', '3 InBody Scans', 'All equipment', 'Locker access', 'Steam bath sessions', 'Priority support'],
  },
  {
    id: 'cmvqi1edv000pnzxw9a8b7c6d',
    name: 'YEARLY',
    priceRs: 18999,
    durationLabel: 'for 12 months',
    features: ['Unlimited Gym access', 'Monthly InBody Scans', 'Full Locker suite', 'Free GymNation T-shirt', 'Steam & Sauna', 'VIP Coach support'],
  },
];

interface MembershipSectionProps {
  showHeader?: boolean;
}

export const MembershipSection: React.FC<MembershipSectionProps> = ({ showHeader = true }) => {
  const { customer, isAuthenticated, openAuthModal } = useCustomerAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Auto-fill customer details when available
  useEffect(() => {
    if (customer) {
      if (customer.name) setName(customer.name);
      if (customer.email) setEmail(customer.email);
      if (customer.phone) setPhone(customer.phone);
    }
  }, [customer]);

  const handleOpenModal = (plan: Plan) => {
    // If not authenticated, require registration first
    if (!isAuthenticated) {
      openAuthModal('register', () => {
        setSelectedPlan(plan);
      });
      return;
    }
    setSelectedPlan(plan);
    setMessage(null);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('register', () => setSelectedPlan(selectedPlan));
      return;
    }
    if (!selectedPlan || !name || !phone || !email) return;

    try {
      setProcessing(true);
      const res = await apiClient.post('/membership/purchase', {
        planId: selectedPlan.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });

      if (!res.data?.success) throw new Error(res.data?.message || 'Initiation failed');

      const { purchaseId, razorpayOrderId, amount, keyId } = res.data.data;

      if (!window.Razorpay) {
        // Fallback simulation for local development
        const verifyRes = await apiClient.post('/membership/verify-payment', {
          purchaseId,
          razorpayOrderId,
          razorpayPaymentId: `pay_sim_${Date.now()}`,
          razorpaySignature: 'sig_sim_demo',
        });
        if (verifyRes.data?.success) {
          setMessage('Membership activated successfully! Welcome to GymNation.');
          setTimeout(() => setSelectedPlan(null), 3000);
        }
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency: 'INR',
        name: 'GymNation – The Fitness Hub',
        description: `Enrollment: ${selectedPlan.name} Plan`,
        image: '/gymnationlogo.png',
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await apiClient.post('/membership/verify-payment', {
              purchaseId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verifyRes.data?.success) {
              setMessage('Membership payment verified! Your gym access is active.');
              setTimeout(() => setSelectedPlan(null), 3000);
            }
          } catch (verr: any) {
            setMessage('Payment verification error: ' + verr.message);
          }
        },
        prefill: { name, email, contact: phone },
        theme: { color: '#7A1F25' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setMessage(err.message || 'Payment initiation failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section id="membership" className={`px-6 lg:px-16 bg-gn-black border-b border-gn-border ${showHeader ? 'py-20' : 'pt-4 pb-20'}`}>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header (Omitted when showHeader is false to avoid duplicate heading below overlay banner) */}
        {showHeader && (
          <ScrollReveal effect="fade-up">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-gn-gold">
                INVEST IN YOUR PHYSICAL EXCELLENCE
              </div>
              <h2 className="font-heading text-4xl sm:text-6xl font-bold uppercase tracking-wide text-gn-ivory">
                MEMBERSHIP <span className="font-accent text-5xl sm:text-7xl text-gn-gold lowercase select-none">plans</span>
              </h2>
              <p className="text-xs sm:text-sm font-mono uppercase tracking-wider text-zinc-400">
                CHOOSE A PLAN THAT FITS YOUR GOAL &bull; ZERO JOINING FEES
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* Pricing Cards Grid with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan, idx) => (
            <ScrollReveal effect="fade-up" delay={idx * 120} key={plan.name}>
              <div
                className={`p-6 bg-gn-surface border flex flex-col justify-between relative transition-all duration-300 h-full ${
                  plan.isPopular
                    ? 'border-2 border-gn-maroon shadow-2xl scale-[1.02]'
                    : 'border-gn-border hover:border-gn-gold/50'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gn-maroon text-white font-mono text-[9px] font-semibold px-3 py-0.5 uppercase tracking-widest border border-gn-gold">
                    MOST POPULAR
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <div className="font-heading font-bold text-2xl uppercase tracking-wider text-gn-ivory">
                      {plan.name}
                    </div>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="font-heading font-bold text-4xl sm:text-5xl text-gn-gold tracking-normal">
                        ₹{plan.priceRs.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 lowercase">
                        /{plan.durationLabel}
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-2 border-t border-gn-border">
                    {plan.features.map((feat, fidx) => (
                      <div key={fidx} className="flex items-center gap-2.5 text-xs text-zinc-300">
                        <CheckIcon className="w-4 h-4 text-gn-gold shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => handleOpenModal(plan)}
                    className={`w-full py-3.5 font-sans font-bold text-xs uppercase tracking-wider transition-colors shadow-md ${
                      plan.isPopular
                        ? 'bg-gn-maroon hover:bg-gn-maroon/80 text-white'
                        : 'bg-gn-black border border-gn-border hover:border-gn-gold text-gn-gold hover:text-white'
                    }`}
                  >
                    JOIN NOW
                  </button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Every Plan Includes Footnote */}
        <div className="p-6 bg-gn-surface border border-gn-border grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-mono">
          <div>
            <div className="font-bold text-gn-ivory uppercase">01 LOCKERS</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Secure electronic lockers</div>
          </div>
          <div>
            <div className="font-bold text-gn-ivory uppercase">02 TRAINERS</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Floor coach guidance</div>
          </div>
          <div>
            <div className="font-bold text-gn-ivory uppercase">03 COMMUNITY</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Surat athletes group</div>
          </div>
          <div>
            <div className="font-bold text-gn-gold uppercase">04 FLEXIBILITY</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Medical hold option</div>
          </div>
        </div>
      </div>

      {/* Online Enrollment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gn-surface border border-gn-border p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-gn-border pb-3">
              <div>
                <h3 className="font-heading text-xl font-bold uppercase text-gn-ivory">
                  ENROLL IN {selectedPlan.name} PLAN
                </h3>
                <span className="text-xs font-mono text-gn-gold">
                  AMOUNT: ₹{selectedPlan.priceRs.toLocaleString('en-IN')} (INCLUSIVE OF GST)
                </span>
              </div>
              <button onClick={() => setSelectedPlan(null)} className="p-1 text-zinc-400 hover:text-white">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {message ? (
              <div className="p-4 bg-green-950/40 border border-green-800 text-green-300 text-xs font-mono font-bold uppercase text-center leading-relaxed">
                {message}
              </div>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-4 text-xs font-mono">
                {isAuthenticated && customer ? (
                  <div className="p-3 bg-white/5 border border-[#F2B91D]/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#F2B91D] font-mono font-bold uppercase block">
                        ✓ REGISTERED ATHLETE VERIFIED
                      </span>
                      <strong className="text-white text-xs">{customer.name}</strong>
                      <span className="text-zinc-400 text-[11px] block">{customer.email}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 bg-green-950/60 text-green-400 border border-green-700/50 font-bold uppercase">
                      ELIGIBLE TO JOIN
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-red-950/40 border border-red-500/50 space-y-2 text-center">
                    <p className="text-red-300 font-bold uppercase text-xs">
                      REGISTRATION REQUIRED BEFORE PURCHASE
                    </p>
                    <p className="text-[11px] text-zinc-300">
                      Please register or sign in to your athlete profile first to activate and bind your membership pass.
                    </p>
                    <button
                      type="button"
                      onClick={() => openAuthModal('register', () => setSelectedPlan(selectedPlan))}
                      className="px-4 py-2 bg-[#F2B91D] text-black font-sans font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors"
                    >
                      REGISTER ACCOUNT NOW →
                    </button>
                  </div>
                )}

                <div>
                  <label className="uppercase text-zinc-300 font-medium block mb-1">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. HARSHIL PATEL"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border p-2.5 uppercase text-gn-ivory font-medium focus:outline-none focus:border-gn-gold"
                  />
                </div>

                <div>
                  <label className="uppercase text-zinc-300 font-medium block mb-1">PHONE NUMBER (10 DIGITS) *</label>
                  <input
                    type="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    placeholder="9825012345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border p-2.5 text-gn-ivory font-medium focus:outline-none focus:border-gn-gold"
                  />
                </div>

                <div>
                  <label className="uppercase text-zinc-300 font-medium block mb-1">EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    required
                    placeholder="harshil@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gn-black border border-gn-border p-2.5 text-gn-ivory font-medium focus:outline-none focus:border-gn-gold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3.5 bg-gn-gold hover:bg-yellow-400 text-gn-black font-sans font-bold text-sm uppercase tracking-wider transition-colors disabled:opacity-50 mt-2 shadow-lg"
                >
                  {processing ? 'OPENING PAYMENT GATEWAY...' : 'PAY & ACTIVATE MEMBERSHIP'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
