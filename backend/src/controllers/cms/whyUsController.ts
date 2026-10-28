import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess } from '../../utils/response.js';
import { recordAuditLog } from '../../services/auditService.js';
import { AuthenticatedAdminRequest } from '../../middlewares/authMiddleware.js';

export const listWhyUsItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = Boolean((req as AuthenticatedAdminRequest).adminUser);
    const where = isAdmin ? {} : { isActive: true };
    const items = await prisma.whyUsItem.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    return sendSuccess(res, items, 'Why Us items retrieved');
  } catch (error) {
    next(error);
  }
};

export const createWhyUsItem = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.whyUsItem.create({ data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'CREATE',
      entity: 'WHY_US_ITEM',
      entityId: item.id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, item, 'Why Us item created', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateWhyUsItem = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.whyUsItem.update({ where: { id }, data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'WHY_US_ITEM',
      entityId: id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, item, 'Why Us item updated');
  } catch (error) {
    next(error);
  }
};

export const deleteWhyUsItem = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.whyUsItem.delete({ where: { id } });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'DELETE',
      entity: 'WHY_US_ITEM',
      entityId: id,
      ip: req.ip,
    });
    return sendSuccess(res, null, 'Why Us item deleted');
  } catch (error) {
    next(error);
  }
};

export const reorderWhyUsItems = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body as { ids: string[] };
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.whyUsItem.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );
    return sendSuccess(res, null, 'Why Us items reordered');
  } catch (error) {
    next(error);
  }
};
