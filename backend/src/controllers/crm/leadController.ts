import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { recordAuditLog } from '../../services/auditService.js';
import { LeadSource, LeadStatus } from '@prisma/client';

// ================= PUBLIC LEAD SUBMISSION =================
export const createPublicLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, phone, email, message, goal, source, website } = req.body;

    // Honeypot trap: if bot filled hidden website field, pretend success without storing
    if (website && website.trim().length > 0) {
      res.json({
        success: true,
        message: 'Thank you! We will get in touch with you shortly.',
      });
      return;
    }

    // Rate-limiting / deduplication: check if same phone submitted within last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await prisma.lead.findFirst({
      where: {
        phone,
        createdAt: { gte: yesterday },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      // Update existing lead message instead of duplicate entry
      const updated = await prisma.lead.update({
        where: { id: existing.id },
        data: {
          name: name || existing.name,
          email: email || existing.email,
          goal: goal || existing.goal,
          message: message ? `${existing.message || ''}\n[Update]: ${message}` : existing.message,
          source: (source as LeadSource) || existing.source,
        },
      });

      res.json({
        success: true,
        message: 'Thank you for reaching out again! Our fitness counselor has received your updated details.',
        data: { id: updated.id },
      });
      return;
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        message: message || null,
        goal: goal || null,
        source: (source as LeadSource) || LeadSource.CONTACT,
        status: LeadStatus.NEW,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your interest! A GymNation fitness counselor will contact you within 2 business hours.',
      data: { id: lead.id },
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN LIST LEADS =================
export const listAdminLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
    const skip = (page - 1) * limit;

    const { status, source, assignedTo, search, from, to } = req.query;

    const where: any = {};

    if (status && Object.values(LeadStatus).includes(status as LeadStatus)) {
      where.status = status;
    }

    if (source && Object.values(LeadSource).includes(source as LeadSource)) {
      where.source = source;
    }

    if (assignedTo) {
      where.assignedTo = String(assignedTo);
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { goal: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }

    const [leads, total, statusGroups] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.count({ where }),
      prisma.lead.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {
      ALL: await prisma.lead.count(),
    };
    for (const group of statusGroups) {
      statusCounts[group.status] = group._count.id;
    }

    res.json({
      success: true,
      data: {
        leads,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        statusCounts,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN UPDATE LEAD =================
export const updateAdminLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, assignedTo, notes } = req.body;
    const admin = (req as any).adminUser;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(notes !== undefined && { notes }),
      },
    });

    await recordAuditLog({
      adminUserId: admin.id,
      action: 'UPDATE',
      entity: 'LEAD',
      entityId: id,
      diff: { previous: existing, updated },
    });

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN DELETE LEAD =================
export const deleteAdminLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const admin = (req as any).adminUser;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    await prisma.lead.delete({ where: { id } });

    await recordAuditLog({
      adminUserId: admin.id,
      action: 'DELETE',
      entity: 'LEAD',
      entityId: id,
      diff: existing,
    });

    res.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN EXPORT LEADS CSV =================
export const exportLeadsCsv = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = 'ID,Name,Phone,Email,Goal,Source,Status,Assigned To,Notes,Created At\n';
    const rows = leads
      .map((l) =>
        [
          `"${l.id}"`,
          `"${(l.name || '').replace(/"/g, '""')}"`,
          `"${l.phone}"`,
          `"${l.email || ''}"`,
          `"${(l.goal || '').replace(/"/g, '""')}"`,
          `"${l.source}"`,
          `"${l.status}"`,
          `"${l.assignedTo || 'Unassigned'}"`,
          `"${(l.notes || '').replace(/"/g, '""')}"`,
          `"${l.createdAt.toISOString()}"`,
        ].join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=gymnation-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(headers + rows);
  } catch (err) {
    next(err);
  }
};
