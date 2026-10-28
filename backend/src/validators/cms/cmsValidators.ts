import { z } from 'zod';
import { MediaBgType, GalleryType } from '@prisma/client';

export const mediaObjectSchema = z.object({
  url: z.string().min(1),
  publicId: z.string().min(1),
  width: z.number().optional(),
  height: z.number().optional(),
  alt: z.string().optional(),
  format: z.string().optional(),
  bytes: z.number().optional(),
});

export const heroSlideSchema = z.object({
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  cursiveWord: z.string().min(1),
  subText: z.string().min(1),
  ctaPrimaryLabel: z.string().min(1),
  ctaPrimaryHref: z.string().min(1),
  ctaSecondaryLabel: z.string().min(1),
  ctaSecondaryHref: z.string().min(1),
  rightImage: mediaObjectSchema.nullable().optional(),
  bgType: z.nativeEnum(MediaBgType).default(MediaBgType.VIDEO),
  bgMedia: mediaObjectSchema.nullable().optional(),
  bgPoster: mediaObjectSchema.nullable().optional(),
  overlayOpacity: z.number().min(0).max(1).default(0.55),
  offerBadgeText: z.string().nullable().optional(),
  offerBadgeSubtext: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const marqueeOfferSchema = z.object({
  text: z.string().min(1),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const pageSectionSchema = z.object({
  pageSlug: z.string().min(1),
  sectionKey: z.string().min(1),
  title: z.string().min(1),
  cursiveWord: z.string().nullable().optional(),
  body: z.string().min(1),
  media: z.array(mediaObjectSchema).nullable().optional(),
  ctaLabel: z.string().nullable().optional(),
  ctaHref: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const whyUsItemSchema = z.object({
  number: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  media: mediaObjectSchema.nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const statSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  suffix: z.string().default('+'),
  sortOrder: z.number().int().default(0),
});

export const galleryItemSchema = z.object({
  type: z.nativeEnum(GalleryType).default(GalleryType.IMAGE),
  media: mediaObjectSchema,
  caption: z.string().min(1),
  category: z.string().default('EQUIPMENT'),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const membershipPlanSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().int().min(0), // in paise
  mrp: z.number().int().min(0),
  durationDays: z.number().int().min(1).default(30),
  durationLabel: z.string().default('per month'),
  features: z.array(z.string()),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const testimonialSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  quote: z.string().min(1),
  photo: mediaObjectSchema.nullable().optional(),
  rating: z.number().int().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().default('GENERAL'),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)),
});
