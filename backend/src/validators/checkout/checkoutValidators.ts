import { z } from 'zod';
import { CouponType, PaymentMethod } from '@prisma/client';

export const addressSnapshotSchema = z.object({
  name: z.string().min(1, 'Recipient name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  line1: z.string().min(3, 'Address line 1 is required'),
  line2: z.string().nullable().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Valid 6-digit pincode is required'),
  country: z.string().default('India'),
});

export const validateCartSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string().min(1),
      qty: z.number().int().min(1),
    })
  ).min(1, 'Cart items array cannot be empty'),
  couponCode: z.string().nullable().optional(),
  state: z.string().default('Gujarat'),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.ONLINE),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  subtotal: z.number().int().min(0),
});

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string().min(1),
      qty: z.number().int().min(1),
    })
  ).min(1, 'Cart items array cannot be empty'),
  shippingAddress: addressSnapshotSchema,
  billingAddress: addressSnapshotSchema.optional(),
  couponCode: z.string().nullable().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.ONLINE),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().min(10).optional(),
  notes: z.string().nullable().optional(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const couponCrudSchema = z.object({
  code: z.string().min(2, 'Coupon code must be at least 2 characters'),
  type: z.nativeEnum(CouponType).default(CouponType.PERCENT),
  value: z.number().int().min(1, 'Discount value must be at least 1'),
  minOrderValue: z.number().int().min(0).default(0), // in paise
  maxDiscount: z.number().int().min(0).nullable().optional(), // in paise
  usageLimit: z.number().int().min(1).nullable().optional(),
  perUserLimit: z.number().int().min(1).default(1),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});
