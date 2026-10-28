import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess } from '../../utils/response.js';
import { recordAuditLog } from '../../services/auditService.js';
import { AuthenticatedAdminRequest } from '../../middlewares/authMiddleware.js';

export const listTestimonials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = Boolean((req as AuthenticatedAdminRequest).adminUser);
    const where = isAdmin ? {} : { isActive: true };
    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    return sendSuccess(res, testimonials, 'Testimonials retrieved');
  } catch (error) {
    next(error);
  }
};

export const createTestimonial = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const item = await prisma.testimonial.create({ data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'CREATE',
      entity: 'TESTIMONIAL',
      entityId: item.id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, item, 'Testimonial created', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.testimonial.update({ where: { id }, data: req.body });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'TESTIMONIAL',
      entityId: id,
      diff: req.body,
      ip: req.ip,
    });
    return sendSuccess(res, item, 'Testimonial updated');
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.testimonial.delete({ where: { id } });
    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'DELETE',
      entity: 'TESTIMONIAL',
      entityId: id,
      ip: req.ip,
    });
    return sendSuccess(res, null, 'Testimonial deleted');
  } catch (error) {
    next(error);
  }
};

export const reorderTestimonials = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body as { ids: string[] };
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.testimonial.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );
    return sendSuccess(res, null, 'Testimonials reordered');
  } catch (error) {
    next(error);
  }
};
