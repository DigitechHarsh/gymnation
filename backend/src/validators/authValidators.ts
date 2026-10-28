import { z } from 'zod';
import { AdminRole } from '@prisma/client';

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createAdminUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  role: z.nativeEnum(AdminRole),
});

export const updateAdminUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number')
    .optional(),
  role: z.nativeEnum(AdminRole).optional(),
  isActive: z.boolean().optional(),
});

export const customerRegisterSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[\s\-\+]/g, '').replace(/^91/, ''))
    .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
      message: 'Phone number must be a valid 10-digit Indian mobile number',
    })
    .optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const customerLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
