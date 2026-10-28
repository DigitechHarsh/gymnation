import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { OrderStatus, PaymentStatus, MembershipStatus, LeadStatus } from '@prisma/client';

export const getAdminDashboardMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      // Orders Aggregations
      ordersToday,
      ordersMonth,
      totalOrders,
      ordersPendingFulfillment,
      ordersByStatusGroup,
      revenueTodayAgg,
      revenueMonthAgg,
      totalRevenueAgg,
      // Inventory Aggregations
      lowStockVariants,
      outOfStockCount,
      // Leads Aggregations
      leadsTodayCount,
      totalLeadsCount,
      convertedLeadsCount,
      leadsByStatusGroup,
      // Memberships Aggregations
      activeMembersCount,
      walkInMembersCount,
      onlineMembersCount,
      expiringMemberships,
      // Recent Feeds
      recentOrders,
      recentLeads,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: { in: [OrderStatus.PAID, OrderStatus.PROCESSING] },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: startOfToday },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: PaymentStatus.PAID },
        _sum: { total: true },
      }),

      // Inventory check (<= 5 units)
      prisma.productVariant.findMany({
        where: { stock: { lte: 5 } },
        take: 8,
        orderBy: { stock: 'asc' },
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.productVariant.count({ where: { stock: 0 } }),

      // Leads Funnel
      prisma.lead.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: LeadStatus.CONVERTED } }),
      prisma.lead.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Memberships
      prisma.membershipPurchase.count({ where: { status: MembershipStatus.ACTIVE } }),
      prisma.membershipPurchase.count({ where: { source: 'WALK_IN' } }),
      prisma.membershipPurchase.count({ where: { source: 'ONLINE' } }),
      prisma.membershipPurchase.findMany({
        where: {
          status: MembershipStatus.ACTIVE,
          endDate: { gte: now, lte: sevenDaysFromNow },
        },
        take: 6,
        orderBy: { endDate: 'asc' },
        include: { plan: { select: { name: true } } },
      }),

      // Recent Activity
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, phone: true } },
          shipment: { select: { awb: true, courierName: true, status: true } },
        },
      }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          adminUser: { select: { name: true, role: true } },
        },
      }),
    ]);

    const revenueToday = revenueTodayAgg._sum.total || 0;
    const revenueMonth = revenueMonthAgg._sum.total || 0;
    const totalRevenue = totalRevenueAgg._sum.total || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const conversionRate = totalLeadsCount > 0 ? ((convertedLeadsCount / totalLeadsCount) * 100).toFixed(1) : '0.0';

    const ordersByStatus: Record<string, number> = {};
    for (const g of ordersByStatusGroup) {
      ordersByStatus[g.status] = g._count.id;
    }

    const leadsByStatus: Record<string, number> = {};
    for (const g of leadsByStatusGroup) {
      leadsByStatus[g.status] = g._count.id;
    }

    const formattedExpiringMembers = expiringMemberships.map((m) => {
      const diffMs = new Date(m.endDate).getTime() - now.getTime();
      const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return {
        id: m.id,
        name: m.name,
        phone: m.phone,
        planName: m.plan.name,
        endDate: m.endDate,
        daysLeft,
      };
    });

    res.json({
      success: true,
      data: {
        financials: {
          revenueTodayPaise: revenueToday,
          revenueMonthPaise: revenueMonth,
          totalRevenuePaise: totalRevenue,
          avgOrderValuePaise: avgOrderValue,
        },
        orders: {
          ordersToday,
          ordersMonth,
          totalOrders,
          pendingFulfillment: ordersPendingFulfillment,
          statusBreakdown: ordersByStatus,
        },
        inventory: {
          lowStockCount: lowStockVariants.length,
          outOfStockCount,
          lowStockItems: lowStockVariants.map((v) => ({
            id: v.id,
            productName: v.product.name,
            variantLabel: v.label,
            stock: v.stock,
          })),
        },
        leads: {
          leadsToday: leadsTodayCount,
          totalLeads: totalLeadsCount,
          convertedLeads: convertedLeadsCount,
          conversionRate,
          statusBreakdown: leadsByStatus,
        },
        memberships: {
          activeCount: activeMembersCount,
          walkInCount: walkInMembersCount,
          onlineCount: onlineMembersCount,
          expiringIn7DaysCount: formattedExpiringMembers.length,
          expiringList: formattedExpiringMembers,
        },
        recentActivity: {
          orders: recentOrders,
          leads: recentLeads,
          auditLogs: recentAuditLogs,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
