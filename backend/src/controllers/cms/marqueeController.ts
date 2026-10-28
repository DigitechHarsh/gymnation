import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess } from '../../utils/response.js';
import { recordAuditLog } from '../../services/auditService.js';
import { AuthenticatedAdminRequest } from '../../middlewares/authMiddleware.js';

export const getPublicMarqueeOffers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const offers = await prisma.marqueeOffer.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return sendSuccess(res, offers, 'Marquee offers retrieved');
  } catch (error) {
    next(error);
  }
};

export const listMarqueeOffers = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const offers = await prisma.marqueeOffer.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return sendSuccess(res, offers, 'Marquee offers retrieved');
  } catch (error) {
    next(error);
  }
};

export const createMarqueeOffer = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const offer = await prisma.marqueeOffer.create({ data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'CREATE',
      entity: 'MARQUEE_OFFER',
      entityId: offer.id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, offer, 'Marquee offer created', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateMarqueeOffer = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const offer = await prisma.marqueeOffer.update({ where: { id }, data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'MARQUEE_OFFER',
      entityId: id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, offer, 'Marquee offer updated');
  } catch (error) {
    next(error);
  }
};

export const deleteMarqueeOffer = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.marqueeOffer.delete({ where: { id } });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'DELETE',
      entity: 'MARQUEE_OFFER',
      entityId: id,
      ip: req.ip,
    });
    return sendSuccess(res, null, 'Marquee offer deleted');
  } catch (error) {
    next(error);
  }
};

export const reorderMarqueeOffers = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body as { ids: string[] };
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.marqueeOffer.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );
    return sendSuccess(res, null, 'Marquee offers reordered');
  } catch (error) {
    next(error);
  }
};
