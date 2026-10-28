import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess, AppError } from '../../utils/response.js';
import { calculateCartTotals } from '../../services/pricingEngine.js';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
} from '../../services/razorpay/razorpayService.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { AuthenticatedCustomerRequest } from '../../middlewares/authMiddleware.js';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

const generateOrderNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.order.count();
  const sequence = (count + 1).toString().padStart(6, '0');
  return `GN-${year}-${sequence}`;
};

export const createOrderEndpoint = async (req: AuthenticatedCustomerRequest, res: Response, next: NextFunction) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      couponCode,
      paymentMethod,
      guestEmail,
      guestPhone,
      notes,
    } = req.body;

    const customerId = req.customer?.id || null;
    const finalBillingAddress = billingAddress || shippingAddress;

    // 1. Re-price all items directly from database
    const calculation = await calculateCartTotals({
      items,
      couponCode,
      state: shippingAddress.state,
      paymentMethod,
    });

    const orderNumber = await generateOrderNumber();
    const stockReservedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock

    // 2. Execute atomic order creation transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      // Re-verify stock inside transaction
      for (const item of calculation.items) {
        const v = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true },
        });

        if (!v || v.stock < item.qty) {
          throw new AppError(`Stock for "${item.productName} - ${item.variantLabel}" is no longer available`, 400);
        }
      }

      const initialStatus: OrderStatus =
        paymentMethod === PaymentMethod.COD ? OrderStatus.PROCESSING : OrderStatus.PENDING_PAYMENT;

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          guestEmail: guestEmail || (customerId ? null : shippingAddress.email),
          guestPhone: guestPhone || shippingAddress.phone,
          shippingAddress,
          billingAddress: finalBillingAddress,
          subtotal: calculation.subtotal,
          discount: calculation.discount,
          shippingFee: calculation.shippingFee,
          taxAmount: calculation.taxAmount,
          total: calculation.total,
          couponCode: calculation.appliedCoupon?.code || null,
          status: initialStatus,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod,
          notes,
          stockReservedUntil: paymentMethod === PaymentMethod.ONLINE ? stockReservedUntil : null,
          items: {
            create: calculation.items.map((i) => ({
              variantId: i.variantId,
              nameSnapshot: `${i.productName} - ${i.variantLabel}`,
              skuSnapshot: i.sku,
              priceSnapshot: i.unitPrice,
              qty: i.qty,
              gstRate: i.gstRate,
              cgstAmount: i.cgstAmount,
              sgstAmount: i.sgstAmount,
              igstAmount: i.igstAmount,
            })),
          },
        },
      });

      // If COD, decrement stock immediately
      if (paymentMethod === PaymentMethod.COD) {
        for (const i of calculation.items) {
          await tx.productVariant.update({
            where: { id: i.variantId },
            data: { stock: { decrement: i.qty } },
          });
        }
      }

      return order;
    });

    // 3. If Online Payment, generate Razorpay Order
    let razorpayData = null;
    if (paymentMethod === PaymentMethod.ONLINE) {
      const rzpOrder = await createRazorpayOrder({
        amountPaise: createdOrder.total,
        orderNumber: createdOrder.orderNumber,
        notes: {
          orderId: createdOrder.id,
          phone: shippingAddress.phone,
        },
      });

      // Save initial payment record
      await prisma.payment.create({
        data: {
          orderId: createdOrder.id,
          provider: 'RAZORPAY',
          razorpayOrderId: rzpOrder.id,
          amount: createdOrder.total,
          currency: 'INR',
          status: 'PENDING',
        },
      });

      razorpayData = {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: env.RAZORPAY_KEY_ID,
      };
    }

    // Clear logged-in user's cart
    if (customerId) {
      await prisma.cartItem.deleteMany({
        where: { cart: { customerId } },
      }).catch(() => {});
    }

    return sendSuccess(
      res,
      {
        order: createdOrder,
        razorpay: razorpayData,
      },
      'Order created successfully',
      undefined,
      201
    );
  } catch (error) {
    next(error);
  }
};

export const verifyPaymentEndpoint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true },
    });

    if (!order) throw new AppError('Order not found', 404);

    // Idempotency: if already paid, return success immediately
    if (order.status === OrderStatus.PAID || order.paymentStatus === PaymentStatus.PAID) {
      return sendSuccess(res, { orderNumber: order.orderNumber, status: 'PAID' }, 'Payment already verified');
    }

    // Verify HMAC SHA256 signature
    const isValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      throw new AppError('Payment signature verification failed. Possible fraud attempt.', 400);
    }

    // Atomic stock decrement and order marking
    await prisma.$transaction(async (tx) => {
      // 1. Decrement stock for each item
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.qty } },
          });
        }
      }

      // 2. Mark order as PAID & clear lock
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          paymentStatus: PaymentStatus.PAID,
          stockReservedUntil: null,
        },
      });

      // 3. Update payment record
      await tx.payment.updateMany({
        where: { orderId: order.id },
        data: {
          status: 'CAPTURED',
          razorpayPaymentId,
          signature: razorpaySignature,
          rawPayload: { razorpayOrderId, razorpayPaymentId },
        },
      });

      // 4. Increment coupon usage
      if (order.couponCode) {
        await tx.coupon.updateMany({
          where: { code: order.couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }
    });

    logger.info(`Order ${order.orderNumber} successfully marked PAID with payment ID ${razorpayPaymentId}`);

    return sendSuccess(
      res,
      {
        orderNumber: order.orderNumber,
        status: OrderStatus.PAID,
      },
      'Payment verified successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const razorpayWebhookEndpoint = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      logger.warn('Invalid Razorpay webhook signature received');
      return res.status(400).json({ status: 'invalid_signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    logger.info(`Received Razorpay Webhook Event: ${event}`);

    if (event === 'payment.captured') {
      const paymentObj = payload.payment.entity;
      const rzpOrderId = paymentObj.order_id;
      const rzpPaymentId = paymentObj.id;

      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: rzpOrderId },
        include: { order: { include: { items: true } } },
      });

      if (payment && payment.order && payment.order.status !== OrderStatus.PAID) {
        await prisma.$transaction(async (tx) => {
          for (const item of payment.order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.qty } },
              });
            }
          }

          await tx.order.update({
            where: { id: payment.order.id },
            data: {
              status: OrderStatus.PAID,
              paymentStatus: PaymentStatus.PAID,
              stockReservedUntil: null,
            },
          });

          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'CAPTURED',
              razorpayPaymentId: rzpPaymentId,
              rawPayload: paymentObj,
            },
          });
        });
        logger.info(`Webhook successfully processed payment.captured for order ${payment.order.orderNumber}`);
      }
    } else if (event === 'payment.failed') {
      const paymentObj = payload.payment.entity;
      const rzpOrderId = paymentObj.order_id;

      await prisma.payment.updateMany({
        where: { razorpayOrderId: rzpOrderId },
        data: {
          status: 'FAILED',
          rawPayload: paymentObj,
        },
      });
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error(error, 'Error processing Razorpay webhook');
    return res.status(500).json({ status: 'error' });
  }
};

export const trackOrderEndpoint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderNumber = req.query.orderNumber as string;
    const phone = req.query.phone as string;

    if (!orderNumber) {
      throw new AppError('Order number is required', 400);
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim().toUpperCase() },
      include: {
        items: true,
        shipment: true,
      },
    });

    if (!order) {
      throw new AppError('No order found with this order number', 404);
    }

    if (phone && !order.guestPhone?.includes(phone) && !(order.shippingAddress as any)?.phone?.includes(phone)) {
      throw new AppError('Phone number does not match order records', 400);
    }

    // Build timeline stages
    const stages = [
      { key: 'ORDER_PLACED', label: 'Order Placed', completed: true, date: order.createdAt },
      {
        key: 'PAID',
        label: 'Payment Verified',
        completed: order.status !== OrderStatus.PENDING_PAYMENT,
      },
      {
        key: 'PROCESSING',
        label: 'Packed & Ready',
        completed: ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
      },
      {
        key: 'SHIPPED',
        label: 'Handed to Courier',
        completed: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
      },
      {
        key: 'DELIVERED',
        label: 'Delivered',
        completed: order.status === OrderStatus.DELIVERED,
      },
    ];

    return sendSuccess(
      res,
      {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        discount: order.discount,
        shippingFee: order.shippingFee,
        total: order.total,
        items: order.items,
        shippingAddress: order.shippingAddress,
        shipment: order.shipment,
        timeline: stages,
      },
      'Order tracking details retrieved'
    );
  } catch (error) {
    next(error);
  }
};
