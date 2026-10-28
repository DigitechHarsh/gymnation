import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess } from '../../utils/response.js';
import { recordAuditLog } from '../../services/auditService.js';
import { AuthenticatedAdminRequest } from '../../middlewares/authMiddleware.js';

export const listGalleryItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string;
    const isAdmin = Boolean((req as AuthenticatedAdminRequest).adminUser);

    const where: any = {};
    if (!isAdmin) where.isActive = true;
    if (category && category !== 'ALL') where.category = category.toUpperCase();

    const items = await prisma.galleryItem.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    return sendSuccess(res, items, 'Gallery items retrieved');
  } catch (error) {
    next(error);
  }
};

export const createGalleryItem = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.galleryItem.create({ data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'CREATE',
      entity: 'GALLERY_ITEM',
      entityId: item.id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, item, 'Gallery item created', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateGalleryItem = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.galleryItem.update({ where: { id }, data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'GALLERY_ITEM',
      entityId: id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, item, 'Gallery item updated');
  } catch (error) {
    next(error);
  }
};

export const deleteGalleryItem = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.galleryItem.delete({ where: { id } });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'DELETE',
      entity: 'GALLERY_ITEM',
      entityId: id,
      ip: req.ip,
    });
    return sendSuccess(res, null, 'Gallery item deleted');
  } catch (error) {
    next(error);
  }
};

export const reorderGalleryItems = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body as { ids: string[] };
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.galleryItem.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );
    return sendSuccess(res, null, 'Gallery items reordered');
  } catch (error) {
    next(error);
  }
};
