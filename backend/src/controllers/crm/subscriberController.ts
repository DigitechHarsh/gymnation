import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { recordAuditLog } from '../../services/auditService.js';

// ================= PUBLIC NEWSLETTER SUBSCRIBE =================
export const subscribePublicEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const normalized = email.trim().toLowerCase();

    const existing = await prisma.subscriber.findUnique({
      where: { email: normalized },
    });

    if (existing) {
      res.json({
        success: true,
        message: 'You are already subscribed to GymNation VIP fitness updates and exclusive supplement drops!',
      });
      return;
    }

    await prisma.subscriber.create({
      data: { email: normalized },
    });

    res.status(201).json({
      success: true,
      message: 'Welcome to GymNation VIP! Check your inbox for your 10% welcome coupon.',
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN LIST SUBSCRIBERS =================
export const listAdminSubscribers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '25', 10)));
    const skip = (page - 1) * limit;
    const search = req.query.search ? String(req.query.search).trim() : '';

    const where: any = search
      ? { email: { contains: search, mode: 'insensitive' } }
      : {};

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscriber.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        subscribers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN DELETE SUBSCRIBER =================
export const deleteAdminSubscriber = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const admin = (req as any).adminUser;

    const existing = await prisma.subscriber.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Subscriber not found' });
      return;
    }

    await prisma.subscriber.delete({ where: { id } });

    await recordAuditLog({
      adminUserId: admin.id,
      action: 'DELETE',
      entity: 'SUBSCRIBER',
      entityId: id,
      diff: existing,
    });

    res.json({
      success: true,
      message: 'Subscriber removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN EXPORT SUBSCRIBERS CSV =================
export const exportSubscribersCsv = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = 'ID,Email,Subscribed At\n';
    const rows = subscribers
      .map((s) => `"${s.id}","${s.email}","${s.createdAt.toISOString()}"`)
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=gymnation-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(headers + rows);
  } catch (err) {
    next(err);
  }
};
