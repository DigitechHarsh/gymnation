import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess, AppError } from '../../utils/response.js';
import { recordAuditLog } from '../../services/auditService.js';
import { AuthenticatedAdminRequest } from '../../middlewares/authMiddleware.js';
import { CouponType } from '@prisma/client';

export const applyCouponEndpoint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, subtotal } = req.body;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError('Invalid or inactive coupon code', 400);
    }

    if (coupon.startsAt && coupon.startsAt > new Date()) {
      throw new AppError('This coupon is not active yet', 400);
    }

    if (coupon.endsAt && coupon.endsAt < new Date()) {
      throw new AppError('This coupon has expired', 400);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit reached', 400);
    }

    if (subtotal < coupon.minOrderValue) {
      const minRs = Math.round(coupon.minOrderValue / 100);
      throw new AppError(`Coupon requires a minimum order value of ₹${minRs}`, 400);
    }

    let discount = 0;
    if (coupon.type === CouponType.PERCENT) {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.value, subtotal);
    }

    return sendSuccess(res, {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount: discount,
      message: `Coupon "${coupon.code}" applied: savings of ₹${Math.round(discount / 100)}`,
    });
  } catch (error) {
    next(error);
  }
};

export const listAdminCoupons = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, coupons, 'Coupons list retrieved');
  } catch (error) {
    next(error);
  }
};

export const createAdminCoupon = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const {
      code,
      type,
      value,
      minOrderValue,
      maxDiscount,
      usageLimit,
      perUserLimit,
      startsAt,
      endsAt,
      isActive,
    } = req.body;

    const cleanCode = code.trim().toUpperCase();
    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      throw new AppError(`Coupon code "${cleanCode}" already exists`, 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        type,
        value: Number(value),
        minOrderValue: Number(minOrderValue) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        perUserLimit: Number(perUserLimit) || 1,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        isActive: isActive !== false,
      },
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'CREATE',
      entity: 'COUPON',
      entityId: coupon.id,
      diff: req.body,
      ip: req.ip,
    });

    return sendSuccess(res, coupon, 'Coupon created successfully', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateAdminCoupon = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const {
      code,
      type,
      value,
      minOrderValue,
      maxDiscount,
      usageLimit,
      perUserLimit,
      startsAt,
      endsAt,
      isActive,
    } = req.body;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) throw new AppError('Coupon not found', 404);

    const cleanCode = code ? code.trim().toUpperCase() : existing.code;
    if (cleanCode !== existing.code) {
      const duplicate = await prisma.coupon.findUnique({ where: { code: cleanCode } });
      if (duplicate && duplicate.id !== id) {
        throw new AppError(`Coupon code "${cleanCode}" already exists`, 400);
      }
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        code: cleanCode,
        ...(type && { type }),
        ...(typeof value === 'number' && { value: Number(value) }),
        ...(typeof minOrderValue === 'number' && { minOrderValue: Number(minOrderValue) }),
        maxDiscount: maxDiscount !== undefined ? (maxDiscount ? Number(maxDiscount) : null) : undefined,
        usageLimit: usageLimit !== undefined ? (usageLimit ? Number(usageLimit) : null) : undefined,
        ...(typeof perUserLimit === 'number' && { perUserLimit: Number(perUserLimit) }),
        startsAt: startsAt !== undefined ? (startsAt ? new Date(startsAt) : null) : undefined,
        endsAt: endsAt !== undefined ? (endsAt ? new Date(endsAt) : null) : undefined,
        ...(typeof isActive === 'boolean' && { isActive }),
      },
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'COUPON',
      entityId: id,
      diff: req.body,
      ip: req.ip,
    });

    return sendSuccess(res, updated, 'Coupon updated');
  } catch (error) {
    next(error);
  }
};

export const deleteAdminCoupon = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.coupon.delete({ where: { id } });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'DELETE',
      entity: 'COUPON',
      entityId: id,
      ip: req.ip,
    });
    return sendSuccess(res, null, 'Coupon deleted');
  } catch (error) {
    next(error);
  }
};
