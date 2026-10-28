import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess, AppError } from '../../utils/response.js';
import { recordAuditLog } from '../../services/auditService.js';
import { AuthenticatedAdminRequest } from '../../middlewares/authMiddleware.js';

export const getLowStockAlerts = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 15;

    const variants = await prisma.productVariant.findMany({
      where: {
        stock: { lte: threshold },
        isActive: true,
        product: { deletedAt: null },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            brand: true,
            images: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { stock: 'asc' },
    });

    return sendSuccess(res, variants, `Low stock variants (threshold <= ${threshold}) retrieved`);
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateInventory = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { updates } = req.body as {
      updates: Array<{ variantId: string; stock?: number; price?: number; mrp?: number }>;
    };

    await prisma.$transaction(
      updates.map((u) => {
        const data: any = {};
        if (typeof u.stock === 'number') data.stock = u.stock;
        if (typeof u.price === 'number') data.price = u.price;
        if (typeof u.mrp === 'number') data.mrp = u.mrp;

        return prisma.productVariant.update({
          where: { id: u.variantId },
          data,
        });
      })
    );

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'BULK_INVENTORY_UPDATE',
      entity: 'PRODUCT_VARIANT',
      diff: { count: updates.length, updates },
      ip: req.ip,
    });

    return sendSuccess(res, null, `${updates.length} variants updated successfully`);
  } catch (error) {
    next(error);
  }
};

export const updateSingleVariantStock = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const variantId = req.params.variantId as string;
    const { stock, price, mrp } = req.body;

    const existing = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!existing) throw new AppError('Variant not found', 404);

    const data: any = {};
    if (typeof stock === 'number') data.stock = stock;
    if (typeof price === 'number') data.price = price;
    if (typeof mrp === 'number') data.mrp = mrp;

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data,
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'STOCK_UPDATE',
      entity: 'PRODUCT_VARIANT',
      entityId: variantId,
      diff: { before: existing.stock, after: updated.stock },
      ip: req.ip,
    });

    return sendSuccess(res, updated, 'Variant stock updated');
  } catch (error) {
    next(error);
  }
};
