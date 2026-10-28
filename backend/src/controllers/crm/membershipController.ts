import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { recordAuditLog } from '../../services/auditService.js';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from '../../services/razorpay/razorpayService.js';
import { env } from '../../config/env.js';
import { MembershipStatus, MembershipSource } from '@prisma/client';

// ================= PUBLIC MEMBERSHIP ONLINE PURCHASE =================
export const purchaseOnlineMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { planId, name, phone, email } = req.body;

    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      res.status(404).json({ success: false, message: 'Membership plan not found or inactive' });
      return;
    }

    const membershipNumber = `MEM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const rzpOrder = await createRazorpayOrder({
      amountPaise: plan.price,
      orderNumber: membershipNumber,
      notes: {
        type: 'MEMBERSHIP',
        planName: plan.name,
        memberName: name,
        phone,
      },
    });

    const now = new Date();
    const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const purchase = await prisma.membershipPurchase.create({
      data: {
        planId: plan.id,
        name,
        phone,
        email,
        startDate: now,
        endDate,
        status: MembershipStatus.ACTIVE, // Created ready, finalized upon verify
        source: MembershipSource.ONLINE,
        paymentId: rzpOrder.id,
      },
      include: { plan: true },
    });

    res.status(201).json({
      success: true,
      message: 'Membership order initiated',
      data: {
        purchaseId: purchase.id,
        razorpayOrderId: rzpOrder.id,
        amount: plan.price,
        currency: 'INR',
        keyId: env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        planName: plan.name,
        durationDays: plan.durationDays,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================= PUBLIC VERIFY MEMBERSHIP PAYMENT =================
export const verifyMembershipPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { purchaseId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    const purchase = await prisma.membershipPurchase.findUnique({
      where: { id: purchaseId },
      include: { plan: true },
    });

    if (!purchase) {
      res.status(404).json({ success: false, message: 'Membership purchase record not found' });
      return;
    }

    const isValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
      return;
    }

    const now = new Date();
    const durationDays = purchase.plan.durationDays;
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const updated = await prisma.membershipPurchase.update({
      where: { id: purchase.id },
      data: {
        status: MembershipStatus.ACTIVE,
        paymentId: razorpayPaymentId,
        startDate: now,
        endDate,
      },
      include: { plan: true },
    });

    res.json({
      success: true,
      message: 'Membership activated successfully! Welcome to GymNation.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN LIST MEMBERSHIPS =================
export const listAdminMemberships = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '25', 10)));
    const skip = (page - 1) * limit;

    const { status, source, planId, search, filter } = req.query;

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const where: any = {};

    if (filter === 'EXPIRING_SOON') {
      where.status = MembershipStatus.ACTIVE;
      where.endDate = { gte: now, lte: sevenDaysFromNow };
    } else if (status && Object.values(MembershipStatus).includes(status as MembershipStatus)) {
      where.status = status;
    }

    if (source && Object.values(MembershipSource).includes(source as MembershipSource)) {
      where.source = source;
    }

    if (planId) {
      where.planId = String(planId);
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Auto-update expired memberships
    await prisma.membershipPurchase.updateMany({
      where: {
        status: MembershipStatus.ACTIVE,
        endDate: { lt: now },
      },
      data: { status: MembershipStatus.EXPIRED },
    });

    const [memberships, total, activeCount, expiredCount, walkInCount, onlineCount, expiringSoonCount] =
      await Promise.all([
        prisma.membershipPurchase.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { plan: true },
        }),
        prisma.membershipPurchase.count({ where }),
        prisma.membershipPurchase.count({ where: { status: MembershipStatus.ACTIVE } }),
        prisma.membershipPurchase.count({ where: { status: MembershipStatus.EXPIRED } }),
        prisma.membershipPurchase.count({ where: { source: MembershipSource.WALK_IN } }),
        prisma.membershipPurchase.count({ where: { source: MembershipSource.ONLINE } }),
        prisma.membershipPurchase.count({
          where: {
            status: MembershipStatus.ACTIVE,
            endDate: { gte: now, lte: sevenDaysFromNow },
          },
        }),
      ]);

    const formatted = memberships.map((m) => {
      const diffMs = new Date(m.endDate).getTime() - now.getTime();
      const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        ...m,
        remainingDays: remainingDays > 0 ? remainingDays : 0,
        isExpiringSoon: remainingDays >= 0 && remainingDays <= 7,
      };
    });

    res.json({
      success: true,
      data: {
        memberships: formatted,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        statusCounts: {
          ALL: await prisma.membershipPurchase.count(),
          ACTIVE: activeCount,
          EXPIRING_SOON: expiringSoonCount,
          EXPIRED: expiredCount,
          WALK_IN: walkInCount,
          ONLINE: onlineCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN ADD WALK-IN MEMBER =================
export const createWalkInMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { planId, name, phone, email, startDate, customDurationDays, notes } = req.body;
    const admin = (req as any).adminUser;

    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      res.status(404).json({ success: false, message: 'Membership plan not found' });
      return;
    }

    const start = startDate ? new Date(startDate) : new Date();
    const durationDays = customDurationDays || plan.durationDays;
    const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const purchase = await prisma.membershipPurchase.create({
      data: {
        planId: plan.id,
        name,
        phone,
        email,
        startDate: start,
        endDate: end,
        status: MembershipStatus.ACTIVE,
        source: MembershipSource.WALK_IN,
        paymentId: `WALKIN-${Date.now()}`,
      },
      include: { plan: true },
    });

    await recordAuditLog({
      adminUserId: admin.id,
      action: 'CREATE',
      entity: 'WALK_IN_MEMBER',
      entityId: purchase.id,
      diff: { name, phone, plan: plan.name, durationDays, notes },
    });

    res.status(201).json({
      success: true,
      message: `Walk-in member ${name} registered successfully for ${plan.name}`,
      data: purchase,
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN EXTEND MEMBERSHIP =================
export const extendAdminMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { additionalDays, reason } = req.body;
    const admin = (req as any).adminUser;

    const existing = await prisma.membershipPurchase.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Membership record not found' });
      return;
    }

    const currentEnd = new Date(existing.endDate);
    const baseDate = currentEnd.getTime() > Date.now() ? currentEnd : new Date();
    const newEnd = new Date(baseDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    const updated = await prisma.membershipPurchase.update({
      where: { id },
      data: {
        endDate: newEnd,
        status: MembershipStatus.ACTIVE,
      },
      include: { plan: true },
    });

    await recordAuditLog({
      adminUserId: admin.id,
      action: 'EXTEND',
      entity: 'MEMBERSHIP',
      entityId: id,
      diff: {
        previousEndDate: existing.endDate,
        newEndDate: newEnd,
        additionalDays,
        reason,
      },
    });

    res.json({
      success: true,
      message: `Membership extended by ${additionalDays} days until ${newEnd.toLocaleDateString('en-IN')}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN CANCEL MEMBERSHIP =================
export const cancelAdminMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const admin = (req as any).adminUser;

    const existing = await prisma.membershipPurchase.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Membership record not found' });
      return;
    }

    const updated = await prisma.membershipPurchase.update({
      where: { id },
      data: { status: MembershipStatus.CANCELLED },
      include: { plan: true },
    });

    await recordAuditLog({
      adminUserId: admin.id,
      action: 'CANCEL',
      entity: 'MEMBERSHIP',
      entityId: id,
      diff: { previousStatus: existing.status, newStatus: MembershipStatus.CANCELLED },
    });

    res.json({
      success: true,
      message: 'Membership status updated to CANCELLED',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ================= GET DIGITAL MEMBERSHIP CARD (CUSTOMER) =================
export const getMyMembershipCard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = (req.query.email as string)?.trim();
    const phone = (req.query.phone as string)?.trim();

    if (!email && !phone) {
      res.status(400).json({ success: false, message: 'Email or phone required to retrieve digital card' });
      return;
    }

    const whereOr: any[] = [];
    if (email) whereOr.push({ email });
    if (phone) whereOr.push({ phone });

    const purchase = await prisma.membershipPurchase.findFirst({
      where: {
        OR: whereOr,
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!purchase) {
      res.status(404).json({
        success: false,
        message: 'No active membership pass found for this athlete profile.',
      });
      return;
    }

    const now = new Date();
    const isExpired = new Date(purchase.endDate) < now;
    const diffMs = new Date(purchase.endDate).getTime() - now.getTime();
    const remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    const cardData = {
      id: purchase.id,
      membershipNumber: `GN-${purchase.source === MembershipSource.ONLINE ? 'ONL' : 'WLK'}-${purchase.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`,
      name: purchase.name,
      phone: purchase.phone,
      email: purchase.email,
      planName: purchase.plan.name,
      price: purchase.plan.price,
      durationDays: purchase.plan.durationDays,
      durationLabel: purchase.plan.durationLabel,
      startDate: purchase.startDate,
      endDate: purchase.endDate,
      status: isExpired ? 'EXPIRED' : purchase.status,
      source: purchase.source,
      remainingDays,
      features: purchase.plan.features,
      facility: {
        gymName: 'GymNation – The Fitness Hub',
        address: 'Bhatar Main Road, Near Bhatar Char Rasta, Surat, Gujarat 395017',
        phone: '+91 85110 31349',
        whatsapp: '+91 85110 31349',
        timings: '6:00 AM – 10:00 PM',
      },
      qrCodeData: JSON.stringify({
        gym: 'GYMNATION_SURAT',
        memberId: purchase.id,
        name: purchase.name,
        plan: purchase.plan.name,
        validTill: purchase.endDate,
      }),
    };

    res.json({
      success: true,
      data: cardData,
    });
  } catch (err) {
    next(err);
  }
};

// ================= GET DIGITAL MEMBERSHIP CARD BY ID (ADMIN) =================
export const getMembershipCardById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ success: false, message: 'Membership ID required' });
      return;
    }
    const purchase = await (prisma.membershipPurchase as any).findUnique({
      where: { id },
      include: { plan: true },
    });
    if (!purchase || !purchase.plan) {
      res.status(404).json({ success: false, message: 'Membership or plan not found' });
      return;
    }
    const now = new Date();
    const isExpired = new Date(purchase.endDate) < now;
    const diffMs = new Date(purchase.endDate).getTime() - now.getTime();
    const remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    res.json({
      success: true,
      data: {
        id: purchase.id,
        membershipNumber: `GN-${purchase.source === MembershipSource.ONLINE ? 'ONL' : 'WLK'}-${purchase.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`,
        name: purchase.name,
        phone: purchase.phone,
        email: purchase.email,
        planName: purchase.plan.name,
        price: purchase.plan.price,
        durationDays: purchase.plan.durationDays,
        durationLabel: purchase.plan.durationLabel,
        startDate: purchase.startDate,
        endDate: purchase.endDate,
        status: isExpired ? 'EXPIRED' : purchase.status,
        source: purchase.source,
        remainingDays,
        features: purchase.plan.features,
        facility: {
          gymName: 'GymNation – The Fitness Hub',
          address: 'Bhatar Main Road, Near Bhatar Char Rasta, Surat, Gujarat 395017',
          phone: '+91 85110 31349',
          whatsapp: '+91 85110 31349',
          timings: '6:00 AM – 10:00 PM',
        },
        qrCodeData: JSON.stringify({
          gym: 'GYMNATION_SURAT',
          memberId: purchase.id,
          name: purchase.name,
          plan: purchase.plan.name,
          validTill: purchase.endDate,
        }),
      },
    });
  } catch (err) {
    next(err);
  }
};
