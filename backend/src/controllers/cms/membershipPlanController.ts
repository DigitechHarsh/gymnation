import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess } from '../../utils/response.js';
import { recordAuditLog } from '../../services/auditService.js';
import { AuthenticatedAdminRequest } from '../../middlewares/authMiddleware.js';

export const listMembershipPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = Boolean((req as AuthenticatedAdminRequest).adminUser);
    const where = isAdmin ? {} : { isActive: true };
    const plans = await prisma.membershipPlan.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    return sendSuccess(res, plans, 'Membership plans retrieved');
  } catch (error) {
    next(error);
  }
};

export const createMembershipPlan = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const plan = await prisma.membershipPlan.create({ data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'CREATE',
      entity: 'MEMBERSHIP_PLAN',
      entityId: plan.id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, plan, 'Membership plan created', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateMembershipPlan = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const plan = await prisma.membershipPlan.update({ where: { id }, data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'MEMBERSHIP_PLAN',
      entityId: id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, plan, 'Membership plan updated');
  } catch (error) {
    next(error);
  }
};

export const deleteMembershipPlan = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.membershipPlan.delete({ where: { id } });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'DELETE',
      entity: 'MEMBERSHIP_PLAN',
      entityId: id,
      ip: req.ip,
    });
    return sendSuccess(res, null, 'Membership plan deleted');
  } catch (error) {
    next(error);
  }
};

export const reorderMembershipPlans = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body as { ids: string[] };
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.membershipPlan.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );
    return sendSuccess(res, null, 'Membership plans reordered');
  } catch (error) {
    next(error);
  }
};
