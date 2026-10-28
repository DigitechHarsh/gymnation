import { z } from 'zod';
import { LeadSource, LeadStatus, MembershipStatus, MembershipSource } from '@prisma/client';

export const leadCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  message: z.string().trim().optional(),
  goal: z.string().trim().optional(),
  source: z.nativeEnum(LeadSource).optional().default(LeadSource.CONTACT),
  website: z.string().optional(), // Honeypot field
});

export const leadUpdateSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  assignedTo: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const subscriberSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

export const membershipPurchaseOnlineSchema = z.object({
  planId: z.string().min(1, 'Plan selection is required'),
  name: z.string().trim().min(2, 'Full name is required'),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Valid 10-digit phone number is required'),
  email: z.string().trim().email('Valid email address is required'),
});

export const membershipVerifyPaymentSchema = z.object({
  purchaseId: z.string().min(1, 'Purchase ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay Signature is required'),
});

export const walkInMemberSchema = z.object({
  planId: z.string().min(1, 'Plan selection is required'),
  name: z.string().trim().min(2, 'Full name is required'),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Valid 10-digit phone number is required'),
  email: z.string().trim().email('Valid email address is required'),
  startDate: z.string().optional(),
  customDurationDays: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const membershipExtendSchema = z.object({
  additionalDays: z.number().int().positive('Additional days must be greater than 0'),
  reason: z.string().trim().min(3, 'Reason for extension is required'),
});
