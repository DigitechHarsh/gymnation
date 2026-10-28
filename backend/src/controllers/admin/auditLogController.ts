import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';

// ================= ADMIN LIST AUDIT LOGS =================
export const listAdminAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '25', 10)));
    const skip = (page - 1) * limit;

    const { entity, action, adminUserId, search, from, to } = req.query;

    const where: any = {};

    if (entity) {
      where.entity = String(entity);
    }

    if (action) {
      where.action = String(action);
    }

    if (adminUserId) {
      where.adminUserId = String(adminUserId);
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { entity: { contains: q, mode: 'insensitive' } },
        { action: { contains: q, mode: 'insensitive' } },
        { entityId: { contains: q, mode: 'insensitive' } },
        { adminUser: { name: { contains: q, mode: 'insensitive' } } },
        { adminUser: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }

    const [logs, total, entities] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          adminUser: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ['entity'],
        _count: { id: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        entities: entities.map((e) => ({ name: e.entity, count: e._count.id })),
      },
    });
  } catch (err) {
    next(err);
  }
};
