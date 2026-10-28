import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, AppError } from '../utils/response.js';
import { recordAuditLog } from '../services/auditService.js';
import { AuthenticatedAdminRequest } from '../middlewares/authMiddleware.js';

export const getPublicSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings) {
      throw new AppError('Site settings not found', 404);
    }

    // Set cache headers (public 5 mins, stale while revalidate)
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

    return sendSuccess(res, settings, 'Site settings retrieved');
  } catch (error) {
    next(error);
  }
};

export const getAdminSettings = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: 'singleton' },
    });
    return sendSuccess(res, settings, 'Admin settings retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateAdminSettings = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const updateData = req.body;

    const previous = await prisma.siteSetting.findUnique({
      where: { id: 'singleton' },
    });

    const updated = await prisma.siteSetting.upsert({
      where: { id: 'singleton' },
      update: updateData,
      create: {
        id: 'singleton',
        ...updateData,
      },
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'SITE_SETTINGS',
      entityId: 'singleton',
      diff: { before: previous, after: updated },
      ip: req.ip,
    });

    return sendSuccess(res, updated, 'Site settings updated successfully');
  } catch (error) {
    next(error);
  }
};
