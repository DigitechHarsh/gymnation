import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess, AppError } from '../../utils/response.js';
import { recordAuditLog } from '../../services/auditService.js';
import { AuthenticatedAdminRequest } from '../../middlewares/authMiddleware.js';

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getPublicProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 12));
    const categoryParam = req.query.category as string;
    const search = req.query.search as string;
    const sort = (req.query.sort as string) || 'featured';
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string) * 100 : undefined;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) * 100 : undefined;
    const inStock = req.query.inStock === 'true';

    const where: any = {
      isActive: true,
      deletedAt: null,
    };

    if (categoryParam && categoryParam !== 'all') {
      where.category = {
        OR: [{ slug: categoryParam }, { id: categoryParam }],
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (inStock) {
      where.variants = {
        some: { stock: { gt: 0 }, isActive: true },
      };
    }

    let orderBy: any = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: {
            where: { isActive: true },
            orderBy: { price: 'asc' },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return sendSuccess(
      res,
      products,
      'Products list retrieved',
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    next(error);
  }
};

export const getPublicProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;

    let product = await prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
      },
    });

    // Check slug redirect record if product not found
    if (!product) {
      const redirect = await prisma.slugRedirect.findUnique({
        where: { oldSlug: slug },
      });
      if (redirect) {
        return res.status(301).json({
          success: true,
          redirect: true,
          newSlug: redirect.newSlug,
          message: `Moved permanently to /products/${redirect.newSlug}`,
        });
      }
      throw new AppError('Product not found', 404);
    }

    // Related products in the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
        deletedAt: null,
      },
      include: {
        category: true,
        variants: { where: { isActive: true } },
      },
      take: 4,
    });

    return sendSuccess(res, { product, relatedProducts }, 'Product details retrieved');
  } catch (error) {
    next(error);
  }
};

export const listAdminProducts = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const search = req.query.search as string;
    const categoryId = req.query.categoryId as string;
    const includeDeleted = req.query.includeDeleted === 'true';

    const where: any = {};
    if (!includeDeleted) where.deletedAt = null;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: { orderBy: { price: 'asc' } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return sendSuccess(res, products, 'Admin products list', {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProductById = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
      },
    });

    if (!product) throw new AppError('Product not found', 404);
    return sendSuccess(res, product, 'Product retrieved');
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      slug: customSlug,
      brand,
      shortDescription,
      description,
      categoryId,
      price,
      mrp,
      sku,
      hsnCode,
      gstRate,
      weightGrams,
      lengthCm,
      breadthCm,
      heightCm,
      images,
      badge,
      isFeatured,
      isActive,
      seoTitle,
      seoDescription,
      variants,
    } = req.body;

    let baseSlug = customSlug ? slugify(customSlug) : slugify(name);
    let finalSlug = baseSlug;
    let counter = 1;

    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          name,
          slug: finalSlug,
          brand: brand || 'GymNation Nutrition',
          shortDescription,
          description,
          categoryId,
          price: Number(price),
          mrp: Number(mrp),
          sku,
          hsnCode: hsnCode || '21069099',
          gstRate: Number(gstRate) || 18.0,
          weightGrams: Number(weightGrams) || 1000,
          lengthCm: Number(lengthCm) || 15,
          breadthCm: Number(breadthCm) || 15,
          heightCm: Number(heightCm) || 25,
          images,
          badge,
          isFeatured: Boolean(isFeatured),
          isActive: Boolean(isActive),
          seoTitle,
          seoDescription,
          variants: {
            create: variants.map((v: any) => ({
              label: v.label,
              flavour: v.flavour || null,
              size: v.size || null,
              sku: v.sku,
              price: Number(v.price),
              mrp: Number(v.mrp),
              stock: Number(v.stock) || 0,
              weightGrams: Number(v.weightGrams) || Number(weightGrams) || 1000,
              isActive: v.isActive !== false,
            })),
          },
        },
        include: { variants: true },
      });

      return createdProduct;
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'CREATE',
      entity: 'PRODUCT',
      entityId: product.id,
      diff: { name, slug: finalSlug, sku },
      ip: req.ip,
    });

    return sendSuccess(res, product, 'Product created successfully', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existing) throw new AppError('Product not found', 404);

    const {
      name,
      slug: customSlug,
      brand,
      shortDescription,
      description,
      categoryId,
      price,
      mrp,
      sku,
      hsnCode,
      gstRate,
      weightGrams,
      lengthCm,
      breadthCm,
      heightCm,
      images,
      badge,
      isFeatured,
      isActive,
      seoTitle,
      seoDescription,
      variants,
    } = req.body;

    let finalSlug = existing.slug;
    if (customSlug && customSlug !== existing.slug) {
      finalSlug = slugify(customSlug);
      const duplicate = await prisma.product.findUnique({ where: { slug: finalSlug } });
      if (duplicate && duplicate.id !== id) {
        throw new AppError(`Slug "${finalSlug}" is already taken by another product`, 400);
      }
      // Record slug redirect for SEO preservation
      await prisma.slugRedirect.upsert({
        where: { oldSlug: existing.slug },
        update: { newSlug: finalSlug },
        create: {
          oldSlug: existing.slug,
          newSlug: finalSlug,
          entityType: 'PRODUCT',
        },
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update product base fields
      const p = await tx.product.update({
        where: { id },
        data: {
          name,
          slug: finalSlug,
          brand,
          shortDescription,
          description,
          categoryId,
          price: Number(price),
          mrp: Number(mrp),
          sku,
          hsnCode,
          gstRate: Number(gstRate),
          weightGrams: Number(weightGrams),
          lengthCm: Number(lengthCm),
          breadthCm: Number(breadthCm),
          heightCm: Number(heightCm),
          images,
          badge,
          isFeatured: Boolean(isFeatured),
          isActive: Boolean(isActive),
          seoTitle,
          seoDescription,
        },
      });

      // 2. Synchronize variants
      if (Array.isArray(variants)) {
        const incomingIds = variants.filter((v) => v.id).map((v) => v.id);

        // Delete removed variants that have no order history
        await tx.productVariant.deleteMany({
          where: {
            productId: id,
            id: { notIn: incomingIds },
            orderItems: { none: {} },
          },
        });

        // For variants that DO have order items, set isActive = false
        await tx.productVariant.updateMany({
          where: {
            productId: id,
            id: { notIn: incomingIds },
            orderItems: { some: {} },
          },
          data: { isActive: false },
        });

        // Upsert incoming variants
        for (const v of variants) {
          if (v.id && existing.variants.some((ex) => ex.id === v.id)) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                label: v.label,
                flavour: v.flavour || null,
                size: v.size || null,
                sku: v.sku,
                price: Number(v.price),
                mrp: Number(v.mrp),
                stock: Number(v.stock),
                weightGrams: Number(v.weightGrams) || Number(weightGrams) || 1000,
                isActive: v.isActive !== false,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                label: v.label,
                flavour: v.flavour || null,
                size: v.size || null,
                sku: v.sku,
                price: Number(v.price),
                mrp: Number(v.mrp),
                stock: Number(v.stock) || 0,
                weightGrams: Number(v.weightGrams) || Number(weightGrams) || 1000,
                isActive: v.isActive !== false,
              },
            });
          }
        }
      }

      return p;
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'PRODUCT',
      entityId: id,
      diff: { name, slug: finalSlug, sku },
      ip: req.ip,
    });

    const fullUpdated = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, category: true },
    });

    return sendSuccess(res, fullUpdated, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            _count: { select: { orderItems: true } },
          },
        },
      },
    });

    if (!existing) throw new AppError('Product not found', 404);

    const hasOrderHistory = existing.variants.some((v) => v._count.orderItems > 0);

    if (hasOrderHistory) {
      // Soft-delete to preserve invoice & customer purchase history
      await prisma.product.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      await recordAuditLog({
        adminUserId: req.adminUser?.id,
        action: 'SOFT_DELETE',
        entity: 'PRODUCT',
        entityId: id,
        diff: { note: 'Soft deleted due to existing order history' },
        ip: req.ip,
      });

      return sendSuccess(res, null, 'Product archived and deactivated (soft-deleted)');
    } else {
      // Hard delete if never ordered
      await prisma.product.delete({ where: { id } });

      await recordAuditLog({
        adminUserId: req.adminUser?.id,
        action: 'HARD_DELETE',
        entity: 'PRODUCT',
        entityId: id,
        ip: req.ip,
      });

      return sendSuccess(res, null, 'Product permanently deleted');
    }
  } catch (error) {
    next(error);
  }
};

export const exportProductsCSV = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Product ID',
      'Name',
      'Slug',
      'Brand',
      'Category',
      'SKU',
      'HSN Code',
      'GST Rate %',
      'Base Price (Rs)',
      'Base MRP (Rs)',
      'Variant SKU',
      'Variant Label',
      'Variant Stock',
      'Variant Price (Rs)',
      'Variant MRP (Rs)',
      'Weight (g)',
      'Featured',
      'Active',
    ];

    const rows: string[] = [headers.join(',')];

    for (const p of products) {
      for (const v of p.variants) {
        const row = [
          `"${p.id}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.slug}"`,
          `"${p.brand}"`,
          `"${p.category.name}"`,
          `"${p.sku}"`,
          `"${p.hsnCode}"`,
          p.gstRate,
          (p.price / 100).toFixed(2),
          (p.mrp / 100).toFixed(2),
          `"${v.sku}"`,
          `"${v.label.replace(/"/g, '""')}"`,
          v.stock,
          (v.price / 100).toFixed(2),
          (v.mrp / 100).toFixed(2),
          v.weightGrams,
          p.isFeatured ? 'YES' : 'NO',
          p.isActive ? 'YES' : 'NO',
        ];
        rows.push(row.join(','));
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="gymnation_products.csv"');
    return res.status(200).send(rows.join('\n'));
  } catch (error) {
    next(error);
  }
};
