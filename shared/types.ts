export type AdminRole = 'SUPER_ADMIN' | 'MANAGER' | 'STAFF';

export type MediaBgType = 'VIDEO' | 'IMAGE';
export type GalleryType = 'IMAGE' | 'VIDEO';
export type CouponType = 'PERCENT' | 'FLAT';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'ONLINE' | 'COD' | 'STORE_PICKUP';

export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type MembershipSource = 'ONLINE' | 'WALK_IN';

export type LeadSource = 'CONTACT' | 'HERO' | 'CTA_BAND' | 'FREE_TRIAL' | 'POPUP';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED';

export interface MediaObject {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  alt?: string;
  format?: string;
  bytes?: number;
}

export interface SiteSettingDTO {
  id: string;
  gymName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
  workingHours: string;
  logo?: MediaObject | null;
  favicon?: MediaObject | null;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
  } | null;
  defaultSeoTitle?: string | null;
  defaultSeoDescription?: string | null;
  defaultOgImage?: MediaObject | null;
  footerText?: string | null;
  globalOverlayOpacity: number;
  codEnabled: boolean;
  codFee: number;
  codMaxOrderValue: number;
  freeShippingThreshold: number;
  flatShippingFee: number;
  gstNumber?: string | null;
  storePickupEnabled: boolean;
  storePickupAddress?: string | null;
  marqueeEnabled: boolean;
  marqueeSpeed: number;
  marqueeBgColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlideDTO {
  id: string;
  eyebrow: string;
  heading: string;
  cursiveWord: string;
  subText: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  rightImage?: MediaObject | null;
  bgType: MediaBgType;
  bgMedia?: MediaObject | null;
  bgPoster?: MediaObject | null;
  overlayOpacity: number;
  offerBadgeText?: string | null;
  offerBadgeSubtext?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarqueeOfferDTO {
  id: string;
  text: string;
  isActive: boolean;
  sortOrder: number;
}

export interface PageSectionDTO {
  id: string;
  pageSlug: string;
  sectionKey: string;
  title: string;
  cursiveWord?: string | null;
  body: string;
  media?: MediaObject[] | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface WhyUsItemDTO {
  id: string;
  number: string;
  title: string;
  description: string;
  media?: MediaObject | null;
  sortOrder: number;
  isActive: boolean;
}

export interface StatDTO {
  id: string;
  label: string;
  value: string;
  suffix: string;
  sortOrder: number;
}

export interface GalleryItemDTO {
  id: string;
  type: GalleryType;
  media: MediaObject;
  caption: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MembershipPlanDTO {
  id: string;
  name: string;
  slug: string;
  price: number; // in paise
  mrp: number; // in paise
  durationDays: number;
  durationLabel: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface TestimonialDTO {
  id: string;
  name: string;
  role: string;
  quote: string;
  photo?: MediaObject | null;
  rating: number;
  isActive: boolean;
  sortOrder: number;
}

export interface FaqItemDTO {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: MediaObject | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductVariantDTO {
  id: string;
  productId: string;
  label: string;
  flavour?: string | null;
  size?: string | null;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
  weightGrams: number;
  isActive: boolean;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  brand: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  category?: CategoryDTO;
  price: number; // base price in paise
  mrp: number;
  sku: string;
  hsnCode: string;
  gstRate: number;
  weightGrams: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  images: MediaObject[];
  badge?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  variants: ProductVariantDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
