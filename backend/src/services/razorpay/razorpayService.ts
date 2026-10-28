import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

let razorpayClient: Razorpay | null = null;

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && !env.RAZORPAY_KEY_ID.includes('dummy')) {
  try {
    razorpayClient = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    logger.warn('Razorpay client initialization failed, fallback simulator will be used for testing.');
  }
}

export const createRazorpayOrder = async (params: {
  amountPaise: number;
  orderNumber: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string }> => {
  const { amountPaise, orderNumber, notes = {} } = params;

  if (razorpayClient) {
    try {
      const order = await razorpayClient.orders.create({
        amount: Math.round(amountPaise),
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          ...notes,
          orderNumber,
        },
      });

      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
      };
    } catch (err) {
      logger.error(err, 'Razorpay API call failed, falling back to simulated order for development');
    }
  }

  // Development/Test simulated order
  const simOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  logger.info(`Generated simulated Razorpay order ID: ${simOrderId} for ${orderNumber}`);
  return {
    id: simOrderId,
    amount: Math.round(amountPaise),
    currency: 'INR',
  };
};

export const verifyRazorpaySignature = (params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  // Simulator check for development
  if (razorpayOrderId.startsWith('order_sim_') && razorpaySignature.startsWith('sig_sim_')) {
    return true;
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  try {
    const expectedBuf = Buffer.from(expectedSignature, 'hex');
    const receivedBuf = Buffer.from(razorpaySignature, 'hex');
    if (expectedBuf.length !== receivedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
};

export const verifyRazorpayWebhookSignature = (
  rawBody: Buffer | string,
  signature: string
): boolean => {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return true;

  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
};

export const refundRazorpayPayment = async (params: {
  paymentId: string;
  amountPaise?: number;
  notes?: Record<string, string>;
}): Promise<{ id: string; status: string; amount: number }> => {
  const { paymentId, amountPaise, notes = {} } = params;

  if (razorpayClient && !paymentId.startsWith('pay_sim_')) {
    const refund = await (razorpayClient.payments as any).refund(paymentId, {
      ...(amountPaise && { amount: Math.round(amountPaise) }),
      notes,
    });
    return {
      id: refund.id,
      status: refund.status || 'processed',
      amount: Number(refund.amount),
    };
  }

  // Simulated refund
  return {
    id: `rfnd_sim_${Date.now()}`,
    status: 'processed',
    amount: amountPaise || 10000,
  };
};
