import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess, AppError } from '../../utils/response.js';
import { recordAuditLog } from '../../services/auditService.js';
import { AuthenticatedAdminRequest } from '../../middlewares/authMiddleware.js';

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getPublicCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: { where: { isActive: true, deletedAt: null } } },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const formatted = categories.map((c) => ({
      ...c,
      productCount: c._count.products,
    }));

    return sendSuccess(res, formatted, 'Categories retrieved');
  } catch (error) {
    next(error);
  }
};

export const listAdminCategories = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const formatted = categories.map((c) => ({
      ...c,
      productCount: c._count.products,
    }));

    return sendSuccess(res, formatted, 'Admin categories retrieved');
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, image, isActive, sortOrder } = req.body;
    const finalSlug = slug ? slugify(slug) : slugify(name);

    const existing = await prisma.category.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      throw new AppError(`Category slug "${finalSlug}" is already taken`, 400);
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        image,
        isActive: typeof isActive === 'boolean' ? isActive : true,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'CREATE',
      entity: 'CATEGORY',
      entityId: category.id,
      diff: req.body,
      ip: req.ip,
    });

    return sendSuccess(res, category, 'Category created', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { name, slug, description, image, isActive, sortOrder } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new AppError('Category not found', 404);

    const finalSlug = slug ? slugify(slug) : slugify(name || existing.name);

    if (finalSlug !== existing.slug) {
      const duplicate = await prisma.category.findUnique({ where: { slug: finalSlug } });
      if (duplicate && duplicate.id !== id) {
        throw new AppError(`Category slug "${finalSlug}" is already taken`, 400);
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        slug: finalSlug,
        description,
        image,
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(typeof sortOrder === 'number' && { sortOrder }),
      },
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'CATEGORY',
      entityId: id,
      diff: req.body,
      ip: req.ip,
    });

    return sendSuccess(res, updated, 'Category updated');
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const productsCount = await prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });
    if (productsCount > 0) {
      throw new AppError(
        `Cannot delete category: ${productsCount} active products are currently assigned to it. Reassign or delete the products first.`,
        400
      );
    }

    await prisma.category.delete({ where: { id } });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'DELETE',
      entity: 'CATEGORY',
      entityId: id,
      ip: req.ip,
    });

    return sendSuccess(res, null, 'Category deleted');
  } catch (error) {
    next(error);
  }
};

export const reorderCategories = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body as { ids: string[] };

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );

    return sendSuccess(res, null, 'Categories reordered');
  } catch (error) {
    next(error);
  }
};
