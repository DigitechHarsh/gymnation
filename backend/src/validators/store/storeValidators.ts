import { z } from 'zod';
import { mediaObjectSchema } from '../cms/cmsValidators.js';

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  image: mediaObjectSchema.nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const productVariantSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Variant label is required (e.g. Chocolate / 1 kg)'),
  flavour: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().int().min(0, 'Price must be positive in paise'),
  mrp: z.number().int().min(0, 'MRP must be positive in paise'),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  weightGrams: z.number().int().min(1).default(1000),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().optional(),
  brand: z.string().default('GymNation Nutrition'),
  shortDescription: z.string().min(1, 'Short description is required'),
  description: z.string().min(1, 'Product description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.number().int().min(0, 'Base price must be positive'),
  mrp: z.number().int().min(0, 'MRP must be positive'),
  sku: z.string().min(1, 'Base SKU is required'),
  hsnCode: z.string().default('21069099'),
  gstRate: z.number().min(0).max(28).default(18.0),
  weightGrams: z.number().int().min(1).default(1000),
  lengthCm: z.number().min(1).default(15),
  breadthCm: z.number().min(1).default(15),
  heightCm: z.number().min(1).default(25),
  images: z.array(mediaObjectSchema).min(1, 'At least one product image is required'),
  badge: z.string().nullable().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  variants: z.array(productVariantSchema).min(1, 'At least one variant is required'),
});

export const bulkInventoryUpdateSchema = z.object({
  updates: z.array(
    z.object({
      variantId: z.string().min(1),
      stock: z.number().int().min(0).optional(),
      price: z.number().int().min(0).optional(),
      mrp: z.number().int().min(0).optional(),
    })
  ).min(1),
});
