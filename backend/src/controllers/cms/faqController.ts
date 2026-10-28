import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess } from '../../utils/response.js';
import { recordAuditLog } from '../../services/auditService.js';
import { AuthenticatedAdminRequest } from '../../middlewares/authMiddleware.js';

export const listFaqItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string;
    const isAdmin = Boolean((req as AuthenticatedAdminRequest).adminUser);

    const where: any = {};
    if (!isAdmin) where.isActive = true;
    if (category) where.category = category.toUpperCase();

    const faqs = await prisma.faqItem.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    return sendSuccess(res, faqs, 'FAQ items retrieved');
  } catch (error) {
    next(error);
  }
};

export const createFaqItem = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.faqItem.create({ data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'CREATE',
      entity: 'FAQ_ITEM',
      entityId: item.id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, item, 'FAQ item created', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateFaqItem = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.faqItem.update({ where: { id }, data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'FAQ_ITEM',
      entityId: id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, item, 'FAQ item updated');
  } catch (error) {
    next(error);
  }
};

export const deleteFaqItem = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.faqItem.delete({ where: { id } });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'DELETE',
      entity: 'FAQ_ITEM',
      entityId: id,
      ip: req.ip,
    });
    return sendSuccess(res, null, 'FAQ item deleted');
  } catch (error) {
    next(error);
  }
};

export const reorderFaqItems = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body as { ids: string[] };
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.faqItem.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );
    return sendSuccess(res, null, 'FAQ items reordered');
  } catch (error) {
    next(error);
  }
};
