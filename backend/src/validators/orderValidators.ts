import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const serviceabilitySchema = z.object({
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, 'Invalid Indian 6-digit postal pincode'),
  weightKg: z.number().positive().optional().default(1.0),
  isCod: z.boolean().optional().default(false),
});

export const orderStatusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
});

export const createShipmentSchema = z.object({
  weightKg: z.number().positive().optional().default(1.0),
  courierName: z.string().optional(),
});

export const refundOrderSchema = z.object({
  amountPaise: z.number().int().positive().optional(),
  reason: z.string().trim().min(3, 'Refund reason required'),
  restoreStock: z.boolean().optional().default(true),
});

export const addOrderNoteSchema = z.object({
  note: z.string().trim().min(1, 'Note content cannot be empty'),
});
