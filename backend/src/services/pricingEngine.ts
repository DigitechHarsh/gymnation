import { prisma } from '../config/db.js';
import { AppError } from '../utils/response.js';
import { CouponType, PaymentMethod } from '@prisma/client';

export interface CartItemInput {
  variantId: string;
  qty: number;
}

export interface PricingResultItem {
  variantId: string;
  productId: string;
  productName: string;
  variantLabel: string;
  sku: string;
  unitPrice: number; // in paise (GST inclusive)
  qty: number;
  totalPrice: number; // unitPrice * qty in paise
  gstRate: number;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  weightGrams: number;
  stockAvailable: number;
}

export interface CartValidationResult {
  items: PricingResultItem[];
  subtotal: number; // in paise
  discount: number; // in paise
  shippingFee: number; // in paise
  taxAmount: number; // total GST included in paise
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  total: number; // in paise
  totalWeightGrams: number;
  appliedCoupon: {
    code: string;
    type: CouponType;
    value: number;
    discountAmount: number;
  } | null;
  shippingRule: {
    freeShippingThreshold: number;
    isFreeShipping: boolean;
    flatShippingFee: number;
  };
}

export const calculateCartTotals = async (params: {
  items: CartItemInput[];
  couponCode?: string | null;
  state?: string | null;
  paymentMethod?: PaymentMethod | 'ONLINE' | 'COD' | 'STORE_PICKUP';
}): Promise<CartValidationResult> => {
  const { items, couponCode, state = 'Gujarat', paymentMethod = 'ONLINE' } = params;

  if (!items || items.length === 0) {
    throw new AppError('Cart cannot be empty', 400);
  }

  // 1. Fetch site settings
  const settings = await prisma.siteSetting.findUnique({ where: { id: 'singleton' } });
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 99900; // ₹999
  const flatShippingFee = settings?.flatShippingFee ?? 9900; // ₹99
  const codFee = settings?.codFee ?? 5000; // ₹50

  // 2. Fetch all variants with their products
  const variantIds = items.map((i) => i.variantId);
  const dbVariants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, isActive: true },
    include: { product: true },
  });

  const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

  // Is Gujarat (Intra-state CGST + SGST) or Inter-state (IGST)
  const isGujarat =
    !state ||
    state.toLowerCase().trim() === 'gujarat' ||
    state.toLowerCase().trim() === 'gj';

  let subtotal = 0;
  let totalWeightGrams = 0;
  let totalTaxAmount = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const resultItems: PricingResultItem[] = [];

  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    if (!variant || !variant.product || variant.product.deletedAt || !variant.product.isActive) {
      throw new AppError(`Item "${item.variantId}" is no longer available`, 400);
    }

    if (item.qty <= 0) {
      throw new AppError(`Quantity for "${variant.product.name}" must be at least 1`, 400);
    }

    if (variant.stock < item.qty) {
      throw new AppError(
        `Insufficient stock for "${variant.product.name} - ${variant.label}". Available: ${variant.stock}, requested: ${item.qty}`,
        400
      );
    }

    const itemTotalPrice = variant.price * item.qty;
    subtotal += itemTotalPrice;

    const itemWeight = (variant.weightGrams || variant.product.weightGrams || 1000) * item.qty;
    totalWeightGrams += itemWeight;

    // GST calculation: prices in India are GST-inclusive
    const gstRate = variant.product.gstRate || 18.0;
    const baseAmount = Math.round(itemTotalPrice / (1 + gstRate / 100));
    const gstAmount = itemTotalPrice - baseAmount;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (isGujarat) {
      cgstAmount = Math.round(gstAmount / 2);
      sgstAmount = gstAmount - cgstAmount;
    } else {
      igstAmount = gstAmount;
    }

    totalTaxAmount += gstAmount;
    totalCgst += cgstAmount;
    totalSgst += sgstAmount;
    totalIgst += igstAmount;

    resultItems.push({
      variantId: variant.id,
      productId: variant.product.id,
      productName: variant.product.name,
      variantLabel: variant.label,
      sku: variant.sku,
      unitPrice: variant.price,
      qty: item.qty,
      totalPrice: itemTotalPrice,
      gstRate,
      gstAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      weightGrams: itemWeight,
      stockAvailable: variant.stock,
    });
  }

  // 3. Coupon discount calculation
  let discount = 0;
  let appliedCoupon: CartValidationResult['appliedCoupon'] = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.trim().toUpperCase() },
    });

    if (
      coupon &&
      coupon.isActive &&
      (!coupon.startsAt || coupon.startsAt <= new Date()) &&
      (!coupon.endsAt || coupon.endsAt >= new Date()) &&
      (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
      subtotal >= coupon.minOrderValue
    ) {
      if (coupon.type === CouponType.PERCENT) {
        let calcDiscount = Math.round((subtotal * coupon.value) / 100);
        if (coupon.maxDiscount && calcDiscount > coupon.maxDiscount) {
          calcDiscount = coupon.maxDiscount;
        }
        discount = calcDiscount;
      } else if (coupon.type === CouponType.FLAT) {
        discount = Math.min(coupon.value, subtotal);
      }

      appliedCoupon = {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount: discount,
      };
    }
  }

  // 4. Shipping fee calculation
  let shippingFee = 0;
  const isStorePickup = paymentMethod === 'STORE_PICKUP';
  const isFreeShipping = subtotal >= freeShippingThreshold || isStorePickup;

  if (!isFreeShipping) {
    shippingFee = flatShippingFee;
  }

  // 5. COD fee check
  if (paymentMethod === 'COD' && settings?.codEnabled) {
    shippingFee += codFee;
  }

  const total = Math.max(0, subtotal - discount + shippingFee);

  return {
    items: resultItems,
    subtotal,
    discount,
    shippingFee,
    taxAmount: totalTaxAmount,
    cgstTotal: totalCgst,
    sgstTotal: totalSgst,
    igstTotal: totalIgst,
    total,
    totalWeightGrams,
    appliedCoupon,
    shippingRule: {
      freeShippingThreshold,
      isFreeShipping,
      flatShippingFee,
    },
  };
};
