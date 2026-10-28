import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess, AppError } from '../../utils/response.js';
import { recordAuditLog } from '../../services/auditService.js';
import { AuthenticatedAdminRequest } from '../../middlewares/authMiddleware.js';

export const getPublicHeroSlides = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return sendSuccess(res, slides, 'Hero slides retrieved');
  } catch (error) {
    next(error);
  }
};

export const listHeroSlides = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return sendSuccess(res, slides, 'Hero slides retrieved');
  } catch (error) {
    next(error);
  }
};

export const getHeroSlideById = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const slide = await prisma.heroSlide.findUnique({ where: { id } });
    if (!slide) throw new AppError('Hero slide not found', 404);
    return sendSuccess(res, slide, 'Hero slide retrieved');
  } catch (error) {
    next(error);
  }
};

export const createHeroSlide = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const slide = await prisma.heroSlide.create({
      data: req.body,
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'CREATE',
      entity: 'HERO_SLIDE',
      entityId: slide.id,
      diff: req.body,
      ip: req.ip,
    });

    return sendSuccess(res, slide, 'Hero slide created', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateHeroSlide = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const slide = await prisma.heroSlide.update({
      where: { id },
      data: req.body,
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'HERO_SLIDE',
      entityId: id,
      diff: req.body,
      ip: req.ip,
    });

    return sendSuccess(res, slide, 'Hero slide updated');
  } catch (error) {
    next(error);
  }
};

export const deleteHeroSlide = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.heroSlide.delete({ where: { id } });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'DELETE',
      entity: 'HERO_SLIDE',
      entityId: id,
      ip: req.ip,
    });

    return sendSuccess(res, null, 'Hero slide deleted');
  } catch (error) {
    next(error);
  }
};

export const reorderHeroSlides = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body as { ids: string[] };

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.heroSlide.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'REORDER',
      entity: 'HERO_SLIDE',
      diff: { ids },
      ip: req.ip,
    });

    return sendSuccess(res, null, 'Hero slides reordered successfully');
  } catch (error) {
    next(error);
  }
};
