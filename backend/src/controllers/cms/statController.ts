import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess } from '../../utils/response.js';
import { recordAuditLog } from '../../services/auditService.js';
import { AuthenticatedAdminRequest } from '../../middlewares/authMiddleware.js';

export const listStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await prisma.stat.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return sendSuccess(res, stats, 'Stats retrieved');
  } catch (error) {
    next(error);
  }
};

export const createStat = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const stat = await prisma.stat.create({ data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'CREATE',
      entity: 'STAT',
      entityId: stat.id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, stat, 'Stat created', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateStat = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const stat = await prisma.stat.update({ where: { id }, data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'STAT',
      entityId: id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, stat, 'Stat updated');
  } catch (error) {
    next(error);
  }
};

export const deleteStat = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.stat.delete({ where: { id } });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'DELETE',
      entity: 'STAT',
      entityId: id,
      ip: req.ip,
    });
    return sendSuccess(res, null, 'Stat deleted');
  } catch (error) {
    next(error);
  }
};

export const reorderStats = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body as { ids: string[] };
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.stat.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );
    return sendSuccess(res, null, 'Stats reordered');
  } catch (error) {
    next(error);
  }
};
