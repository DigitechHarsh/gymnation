import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess, AppError } from '../../utils/response.js';
import { recordAuditLog } from '../../services/auditService.js';
import { AuthenticatedAdminRequest } from '../../middlewares/authMiddleware.js';

export const getPublicPageSections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const sections = await prisma.pageSection.findMany({
      where: { pageSlug: slug, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return sendSuccess(res, sections, `Page sections for ${slug} retrieved`);
  } catch (error) {
    next(error);
  }
};

export const listAllPageSections = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const slug = req.query.slug as string;
    const where: any = {};
    if (slug) where.pageSlug = slug;

    const sections = await prisma.pageSection.findMany({
      where,
      orderBy: [{ pageSlug: 'asc' }, { sortOrder: 'asc' }],
    });
    return sendSuccess(res, sections, 'All page sections retrieved');
  } catch (error) {
    next(error);
  }
};

export const createPageSection = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const section = await prisma.pageSection.create({ data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'CREATE',
      entity: 'PAGE_SECTION',
      entityId: section.id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, section, 'Page section created', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updatePageSection = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const section = await prisma.pageSection.update({ where: { id }, data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'PAGE_SECTION',
      entityId: id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, section, 'Page section updated');
  } catch (error) {
    next(error);
  }
};

export const deletePageSection = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.pageSection.delete({ where: { id } });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'DELETE',
      entity: 'PAGE_SECTION',
      entityId: id,
      ip: req.ip,
    });
    return sendSuccess(res, null, 'Page section deleted');
  } catch (error) {
    next(error);
  }
};
