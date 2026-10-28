import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, AppError } from '../utils/response.js';
import { getCloudinarySignature, checkMediaUsage, deleteCloudinaryAsset } from '../services/mediaService.js';
import { recordAuditLog } from '../services/auditService.js';
import { AuthenticatedAdminRequest } from '../middlewares/authMiddleware.js';

export const getUploadSignature = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const folder = (req.query.folder as string) || 'gymnation';
    const signatureData = getCloudinarySignature(folder);
    return sendSuccess(res, signatureData, 'Upload signature generated');
  } catch (error) {
    next(error);
  }
};

export const recordMediaUpload = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { url, publicId, format, width, height, bytes, alt, folder } = req.body;

    if (!url || !publicId) {
      throw new AppError('Url and publicId are required', 400);
    }

    const mediaItem = await prisma.mediaItem.upsert({
      where: { publicId },
      update: {
        url,
        format,
        width,
        height,
        bytes,
        alt,
        folder: folder || 'gymnation',
      },
      create: {
        url,
        publicId,
        format,
        width,
        height,
        bytes,
        alt,
        folder: folder || 'gymnation',
      },
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPLOAD',
      entity: 'MEDIA',
      entityId: mediaItem.id,
      diff: { url, publicId },
      ip: req.ip,
    });

    return sendSuccess(res, mediaItem, 'Media recorded successfully', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const listMedia = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;
    const search = req.query.search as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { publicId: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.mediaItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mediaItem.count({ where }),
    ]);

    return sendSuccess(
      res,
      items,
      'Media list retrieved',
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

export const checkMediaUsageEndpoint = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.mediaItem.findUnique({ where: { id } });
    if (!item) {
      throw new AppError('Media item not found', 404);
    }

    const usages = await checkMediaUsage(item.publicId, item.url);
    return sendSuccess(res, { item, usages, isInUse: usages.length > 0 }, 'Usage check completed');
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const force = req.query.force === 'true';

    const item = await prisma.mediaItem.findUnique({ where: { id } });
    if (!item) {
      throw new AppError('Media item not found', 404);
    }

    const usages = await checkMediaUsage(item.publicId, item.url);
    if (usages.length > 0 && !force) {
      return res.status(409).json({
        success: false,
        message: 'Media is currently in use across the website',
        data: { usages },
      });
    }

    await deleteCloudinaryAsset(item.publicId);
    await prisma.mediaItem.delete({ where: { id } });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'DELETE',
      entity: 'MEDIA',
      entityId: id,
      diff: { publicId: item.publicId, url: item.url },
      ip: req.ip,
    });

    return sendSuccess(res, null, 'Media deleted successfully');
  } catch (error) {
    next(error);
  }
};
