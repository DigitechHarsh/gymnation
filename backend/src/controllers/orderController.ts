import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { recordAuditLog } from '../services/auditService.js';
import { refundRazorpayPayment } from '../services/razorpay/razorpayService.js';
import {
  checkPincodeServiceability,
  createShiprocketShipment,
  scheduleShipmentPickup,
  trackShiprocketAwb,
} from '../services/shipping/shiprocketService.js';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

// ================= PUBLIC SHIPPING SERVICEABILITY =================
export const checkShippingServiceability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { pincode, weightKg, isCod } = req.body;
    const result = await checkPincodeServiceability({
      deliveryPincode: pincode,
      weightKg,
      isCod,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN ORDER LIST =================
export const listAdminOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || '20', 10)));
    const skip = (page - 1) * limit;

    const { status, paymentStatus, paymentMethod, search, from, to } = req.query;

    const where: any = {};

    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status;
    }

    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus as PaymentStatus)) {
      where.paymentStatus = paymentStatus;
    }

    if (paymentMethod && Object.values(PaymentMethod).includes(paymentMethod as PaymentMethod)) {
      where.paymentMethod = paymentMethod;
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { guestEmail: { contains: q, mode: 'insensitive' } },
        { guestPhone: { contains: q, mode: 'insensitive' } },
        { customer: { name: { contains: q, mode: 'insensitive' } } },
        { customer: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }

    const [orders, total, statusCountsRaw] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          items: {
            select: {
              id: true,
              nameSnapshot: true,
              skuSnapshot: true,
              priceSnapshot: true,
              qty: true,
            },
          },
          shipment: {
            select: {
              id: true,
              awb: true,
              courierName: true,
              status: true,
              trackingUrl: true,
              labelUrl: true,
            },
          },
          payments: {
            select: {
              id: true,
              provider: true,
              status: true,
              amount: true,
              razorpayPaymentId: true,
            },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.order.count({ where }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    // Build counts dictionary for UI tab badges
    const statusCounts: Record<string, number> = {
      ALL: await prisma.order.count(),
    };
    for (const group of statusCountsRaw) {
      statusCounts[group.status] = group._count.id;
    }

    res.json({
      success: true,
      data: {
        orders,
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

// ================= ADMIN ORDER DETAIL =================
export const getAdminOrderDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        customer: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: true,
                    category: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        shipment: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN UPDATE ORDER STATUS =================
export const updateAdminOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;
    const admin = (req as any).adminUser;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingOrder) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const previousStatus = existingOrder.status;

    // If changing to CANCELLED and not already cancelled, restore inventory stock
    if (status === OrderStatus.CANCELLED && previousStatus !== OrderStatus.CANCELLED) {
      await prisma.$transaction(async (tx: any) => {
        for (const item of existingOrder.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.qty } },
            });
          }
        }
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(notes && {
          notes: existingOrder.notes
            ? `${existingOrder.notes}\n[${new Date().toISOString().slice(0, 16)}] ${admin.name}: ${notes}`
            : `[${new Date().toISOString().slice(0, 16)}] ${admin.name}: ${notes}`,
        }),
      },
      include: { shipment: true, items: true, payments: true },
    });

    await recordAuditLog({
      adminUserId: admin.id,
      action: 'UPDATE',
      entity: 'ORDER_STATUS',
      entityId: id,
      diff: { previousStatus, newStatus: status, notes },
    });

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN DISPATCH SHIPROCKET SHIPMENT =================
export const dispatchShiprocketOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { weightKg } = req.body;
    const admin = (req as any).adminUser;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        shipment: true,
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.status === OrderStatus.CANCELLED) {
      res.status(400).json({ success: false, message: 'Cannot dispatch a cancelled order' });
      return;
    }

    const shippingAddr: any = order.shippingAddress || {};
    const customerName = shippingAddr.name || order.customer?.name || 'Customer';
    const customerEmail = order.guestEmail || order.customer?.email || 'customer@gymnation.in';
    const customerPhone = shippingAddr.phone || order.guestPhone || order.customer?.phone || '9876543210';

    const shipmentResult = await createShiprocketShipment({
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customerName,
      email: customerEmail,
      phone: customerPhone,
      shippingAddress: {
        line1: shippingAddr.line1 || 'Floor 2, Fitness Boulevard',
        line2: shippingAddr.line2,
        city: shippingAddr.city || 'Surat',
        state: shippingAddr.state || 'Gujarat',
        pincode: shippingAddr.pincode || '395009',
        country: shippingAddr.country || 'India',
      },
      items: order.items.map((it: any) => ({
        name: it.nameSnapshot,
        sku: it.skuSnapshot,
        qty: it.qty,
        pricePaise: it.priceSnapshot,
      })),
      paymentMethod: order.paymentMethod,
      subtotalPaise: order.subtotal,
      discountPaise: order.discount,
      shippingFeePaise: order.shippingFee,
      totalPaise: order.total,
      weightKg,
    });

    // Upsert shipment record in database
    const shipment = await prisma.shipment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        shiprocketOrderId: shipmentResult.shiprocketOrderId,
        shipmentId: shipmentResult.shipmentId,
        awb: shipmentResult.awb,
        courierName: shipmentResult.courierName,
        status: shipmentResult.status,
        labelUrl: shipmentResult.labelUrl,
        manifestUrl: shipmentResult.manifestUrl,
        trackingUrl: shipmentResult.trackingUrl,
      },
      update: {
        shiprocketOrderId: shipmentResult.shiprocketOrderId,
        shipmentId: shipmentResult.shipmentId,
        awb: shipmentResult.awb,
        courierName: shipmentResult.courierName,
        status: shipmentResult.status,
        labelUrl: shipmentResult.labelUrl || undefined,
        manifestUrl: shipmentResult.manifestUrl || undefined,
        trackingUrl: shipmentResult.trackingUrl || undefined,
      },
    });

    // Advance order to PROCESSING or SHIPPED
    const nextOrderStatus = order.status === OrderStatus.PAID ? OrderStatus.PROCESSING : order.status;
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: nextOrderStatus },
      include: { shipment: true, items: true, payments: true },
    });

    await recordAuditLog({
      adminUserId: admin.id,
      action: 'CREATE',
      entity: 'SHIPROCKET_DISPATCH',
      entityId: order.id,
      diff: {
        awb: shipmentResult.awb,
        courier: shipmentResult.courierName,
        status: shipmentResult.status,
      },
    });

    res.json({
      success: true,
      message: `Shiprocket order created with AWB ${shipmentResult.awb}`,
      data: {
        order: updatedOrder,
        shipment,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN SCHEDULE SHIPMENT PICKUP =================
export const scheduleOrderPickup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const admin = (req as any).adminUser;

    const shipment = await prisma.shipment.findUnique({
      where: { orderId: id },
    });

    if (!shipment || !shipment.shipmentId) {
      res.status(400).json({ success: false, message: 'Shipment has not been created yet' });
      return;
    }

    const pickupRes = await scheduleShipmentPickup(shipment.shipmentId);

    const updatedShipment = await prisma.shipment.update({
      where: { id: shipment.id },
      data: {
        pickupScheduledAt: pickupRes.date ? new Date(pickupRes.date) : new Date(),
        status: 'PICKUP_SCHEDULED',
      },
    });

    await recordAuditLog({
      adminUserId: admin.id,
      action: 'UPDATE',
      entity: 'SHIPMENT_PICKUP',
      entityId: id,
      diff: pickupRes,
    });

    res.json({
      success: true,
      message: pickupRes.message,
      data: updatedShipment,
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN CANCEL ORDER =================
export const cancelAdminOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const admin = (req as any).adminUser;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.status === OrderStatus.CANCELLED) {
      res.status(400).json({ success: false, message: 'Order is already cancelled' });
      return;
    }

    if (order.status === OrderStatus.DELIVERED) {
      res.status(400).json({ success: false, message: 'Cannot cancel an already delivered order' });
      return;
    }

    // Atomically restore variant stock
    await prisma.$transaction(async (tx: any) => {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.qty } },
          });
        }
      }

      await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          notes: order.notes
            ? `${order.notes}\n[${new Date().toISOString().slice(0, 16)}] ${admin.name}: Cancelled order and restored stock`
            : `[${new Date().toISOString().slice(0, 16)}] ${admin.name}: Cancelled order and restored stock`,
        },
      });
    });

    await recordAuditLog({
      adminUserId: admin.id,
      action: 'CANCEL',
      entity: 'ORDER',
      entityId: id,
      diff: { previousStatus: order.status, newStatus: OrderStatus.CANCELLED },
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully and stock restored',
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN REFUND ORDER =================
export const refundAdminOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { amountPaise, reason, restoreStock } = req.body;
    const admin = (req as any).adminUser;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Find the latest successful payment
    const payment = order.payments.find(
      (p: any) => p.status === 'PAID' || p.status === 'CAPTURED' || p.razorpayPaymentId
    );

    const paymentId = payment?.razorpayPaymentId || `pay_sim_${order.orderNumber}`;
    const refundAmount = amountPaise || order.total;

    // Trigger Razorpay refund via service
    const refundResult = await refundRazorpayPayment({
      paymentId,
      amountPaise: refundAmount,
      notes: {
        orderNumber: order.orderNumber,
        reason,
        refundedBy: admin.name,
      },
    });

    // Update order and stock in a single transaction
    await prisma.$transaction(async (tx: any) => {
      if (restoreStock) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.qty } },
            });
          }
        }
      }

      await tx.payment.create({
        data: {
          orderId: order.id,
          provider: payment?.provider || 'RAZORPAY',
          amount: refundAmount,
          status: 'REFUNDED',
          refundId: refundResult.id,
          refundAmount,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.REFUNDED,
          paymentStatus: PaymentStatus.REFUNDED,
          notes: order.notes
            ? `${order.notes}\n[${new Date().toISOString().slice(0, 16)}] ${admin.name}: Refund processed: ₹${(refundAmount / 100).toFixed(2)} (Refund ID: ${refundResult.id}, Reason: ${reason})`
            : `[${new Date().toISOString().slice(0, 16)}] ${admin.name}: Refund processed: ₹${(refundAmount / 100).toFixed(2)} (Refund ID: ${refundResult.id}, Reason: ${reason})`,
        },
      });
    });

    await recordAuditLog({
      adminUserId: admin.id,
      action: 'REFUND',
      entity: 'ORDER',
      entityId: id,
      diff: { refundResult, amount: refundAmount, reason, restoreStock },
    });

    res.json({
      success: true,
      message: `Refund of ₹${(refundAmount / 100).toFixed(2)} processed successfully`,
      data: {
        refundId: refundResult.id,
        amount: refundAmount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ================= ADMIN ADD ORDER NOTES =================
export const addAdminOrderNote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { note } = req.body;
    const admin = (req as any).adminUser;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const formattedNote = `[${timestamp} - ${admin.name}]: ${note}`;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        notes: order.notes ? `${order.notes}\n${formattedNote}` : formattedNote,
      },
    });

    res.json({
      success: true,
      message: 'Note added to order',
      data: { notes: updated.notes },
    });
  } catch (err) {
    next(err);
  }
};

// ================= PRINTABLE GST TAX INVOICE HTML =================
export const generateOrderInvoiceHtml = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const [order, settings] = await Promise.all([
      prisma.order.findFirst({
        where: { OR: [{ id }, { orderNumber: id }] },
        include: {
          customer: true,
          items: true,
          shipment: true,
          payments: { take: 1, orderBy: { createdAt: 'desc' } },
        },
      }),
      prisma.siteSetting.findUnique({ where: { id: 'singleton' } }),
    ]);

    if (!order) {
      res.status(404).send('<h1>Order not found</h1>');
      return;
    }

    const shipping: any = order.shippingAddress || {};
    const billing: any = order.billingAddress || shipping;
    const invoiceNumber = order.invoiceNumber || `INV-${order.orderNumber}`;
    const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const isGujarat = (shipping.state || '').toLowerCase().includes('gujarat');
    const totalGst = (order.taxAmount / 100).toFixed(2);
    const subtotal = (order.subtotal / 100).toFixed(2);
    const discount = (order.discount / 100).toFixed(2);
    const shippingFee = (order.shippingFee / 100).toFixed(2);
    const total = (order.total / 100).toFixed(2);

    const itemsRows = order.items
      .map((item: any, idx: number) => {
        const itemTaxable = (item.priceSnapshot * item.qty) / (1 + item.gstRate / 100);
        const taxableRs = (itemTaxable / 100).toFixed(2);
        const lineTotalRs = ((item.priceSnapshot * item.qty) / 100).toFixed(2);
        const cgstRs = (item.cgstAmount / 100).toFixed(2);
        const sgstRs = (item.sgstAmount / 100).toFixed(2);
        const igstRs = (item.igstAmount / 100).toFixed(2);

        return `
          <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 10px 8px; text-align: center; color: #888;">${idx + 1}</td>
            <td style="padding: 10px 8px; color: #f4efe8; font-weight: 600;">
              ${item.nameSnapshot}
              <div style="font-size: 11px; color: #888; font-family: monospace;">SKU: ${item.skuSnapshot}</div>
            </td>
            <td style="padding: 10px 8px; text-align: center; color: #aaa; font-family: monospace;">21069099</td>
            <td style="padding: 10px 8px; text-align: center; color: #f4efe8;">${item.qty}</td>
            <td style="padding: 10px 8px; text-align: right; color: #f4efe8;">₹${(item.priceSnapshot / 100).toFixed(2)}</td>
            <td style="padding: 10px 8px; text-align: right; color: #aaa;">₹${taxableRs}</td>
            <td style="padding: 10px 8px; text-align: center; color: #888;">${item.gstRate}%</td>
            <td style="padding: 10px 8px; text-align: right; color: #aaa;">${isGujarat ? `CGST: ₹${cgstRs}<br/>SGST: ₹${sgstRs}` : `IGST: ₹${igstRs}`}</td>
            <td style="padding: 10px 8px; text-align: right; color: #F2B91D; font-weight: 700;">₹${lineTotalRs}</td>
          </tr>
        `;
      })
      .join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>GST Tax Invoice - ${invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0b0a0a;
      color: #f4efe8;
      font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      padding: 40px;
    }
    .invoice-card {
      max-width: 900px;
      margin: 0 auto;
      background: #161313;
      border: 1px solid #2a2424;
      padding: 40px;
      position: relative;
    }
    .brand-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #f4efe8;
      line-height: 1;
    }
    .brand-accent {
      color: #7A1F25;
    }
    .gold-accent {
      color: #F2B91D;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #7A1F25;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
    }
    th {
      background: #1f1b1b;
      padding: 10px 8px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #aaa;
      border-bottom: 2px solid #7A1F25;
    }
    .print-btn {
      background: #7A1F25;
      color: #fff;
      border: 1px solid #7A1F25;
      padding: 10px 24px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.05em;
      cursor: pointer;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    @media print {
      body { background: #fff; color: #000; padding: 0; }
      .invoice-card { background: #fff; border: none; padding: 0; color: #000; }
      .print-btn { display: none; }
      th { background: #f0f0f0; color: #000; }
      .brand-title, .gold-accent { color: #000; }
      .brand-accent { color: #7A1F25; }
    }
  </style>
</head>
<body>
  <div style="max-width: 900px; margin: 0 auto; display: flex; justify-content: flex-end;">
    <button class="print-btn" onclick="window.print()">PRINT / DOWNLOAD INVOICE</button>
  </div>

  <div class="invoice-card">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #7A1F25; padding-bottom: 24px;">
      <div>
        <div class="brand-title">GYMNATION <span class="brand-accent">//</span> TAX INVOICE</div>
        <div style="color: #aaa; font-size: 12px; margin-top: 6px;">The Fitness Hub & Supplement Store</div>
        <div style="color: #888; font-size: 12px; margin-top: 4px;">${settings?.address || 'Adajan, Surat, Gujarat 395009, India'}</div>
        <div style="color: #F2B91D; font-size: 12px; font-weight: 600; margin-top: 4px;">GSTIN: ${settings?.gstNumber || '24AAAAA0000A1Z5'}</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">ORIGINAL FOR RECIPIENT</span>
        <div style="font-size: 18px; font-weight: 700; color: #f4efe8; margin-top: 10px;">${invoiceNumber}</div>
        <div style="color: #aaa; font-size: 12px; margin-top: 4px;">Date: <strong>${invoiceDate}</strong></div>
        <div style="color: #aaa; font-size: 12px;">Order ID: <strong>${order.orderNumber}</strong></div>
      </div>
    </div>

    <!-- Addresses -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 24px;">
      <div style="background: #110e0e; padding: 16px; border-left: 2px solid #7A1F25;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin-bottom: 6px;">BILLED TO:</div>
        <div style="font-size: 14px; font-weight: 700; color: #f4efe8;">${billing.name || order.customer?.name || 'Valued Customer'}</div>
        <div style="color: #aaa; font-size: 12px; margin-top: 4px;">${billing.line1 || ''} ${billing.line2 || ''}</div>
        <div style="color: #aaa; font-size: 12px;">${billing.city || ''}, ${billing.state || ''} - ${billing.pincode || ''}</div>
        <div style="color: #888; font-size: 12px; margin-top: 4px;">Phone: ${billing.phone || order.guestPhone || ''}</div>
        <div style="color: #888; font-size: 12px;">Email: ${order.guestEmail || order.customer?.email || ''}</div>
      </div>

      <div style="background: #110e0e; padding: 16px; border-left: 2px solid #F2B91D;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin-bottom: 6px;">SHIPPED TO:</div>
        <div style="font-size: 14px; font-weight: 700; color: #f4efe8;">${shipping.name || order.customer?.name || 'Valued Customer'}</div>
        <div style="color: #aaa; font-size: 12px; margin-top: 4px;">${shipping.line1 || ''} ${shipping.line2 || ''}</div>
        <div style="color: #aaa; font-size: 12px;">${shipping.city || ''}, ${shipping.state || ''} - ${shipping.pincode || ''}</div>
        <div style="color: #888; font-size: 12px; margin-top: 4px;">Method: <strong>${order.paymentMethod}</strong> | Status: <strong>${order.paymentStatus}</strong></div>
        ${order.shipment?.awb ? `<div style="color: #F2B91D; font-size: 12px;">AWB: <strong>${order.shipment.awb}</strong> (${order.shipment.courierName})</div>` : ''}
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th style="text-align: left;">Item Description</th>
          <th>HSN</th>
          <th>Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Taxable</th>
          <th>GST %</th>
          <th style="text-align: right;">Tax Amount</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <!-- Totals & Tax Summary -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px;">
      <div style="max-width: 480px; font-size: 11px; color: #888; line-height: 1.6;">
        <div style="color: #f4efe8; font-weight: 600; margin-bottom: 4px;">DECLARATION & TERMS</div>
        <div>1. We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</div>
        <div>2. Goods once sold are genuine and sealed from authorized brand distributors.</div>
        <div>3. All disputes are subject to Surat jurisdiction only.</div>
      </div>

      <div style="width: 320px; background: #110e0e; padding: 18px; border: 1px solid #2a2424;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #aaa;">
          <span>Subtotal:</span>
          <span>₹${subtotal}</span>
        </div>
        ${
          order.discount > 0
            ? `
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #7A1F25;">
          <span>Discount (${order.couponCode || 'Promo'}):</span>
          <span>-₹${discount}</span>
        </div>`
            : ''
        }
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #aaa;">
          <span>Shipping Fee:</span>
          <span>${order.shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #aaa; border-bottom: 1px solid #222; padding-bottom: 8px;">
          <span>Total GST Included:</span>
          <span>₹${totalGst}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 10px; font-size: 18px; font-weight: 800; color: #F2B91D;">
          <span>FINAL AMOUNT:</span>
          <span>₹${total}</span>
        </div>
      </div>
    </div>

    <!-- Signatory -->
    <div style="margin-top: 50px; display: flex; justify-content: flex-end; text-align: center;">
      <div style="width: 240px; border-top: 1px dashed #666; padding-top: 8px;">
        <div style="font-weight: 700; color: #f4efe8;">FOR GYMNATION</div>
        <div style="font-size: 11px; color: #888;">Authorized Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    next(err);
  }
};

// ================= SHIPROCKET WEBHOOK =================
export const shiprocketWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = req.body;
    logger.info({ payload }, 'Received Shiprocket Webhook Event');

    const awb = payload.awb || payload.awb_code;
    const currentStatus = (payload.current_status || payload.status || '').toUpperCase();

    if (!awb) {
      res.json({ success: true, message: 'No AWB found in webhook payload' });
      return;
    }

    const shipment = await prisma.shipment.findFirst({
      where: { awb },
      include: { order: true },
    });

    if (!shipment) {
      logger.warn(`Shipment with AWB ${awb} not found in database`);
      res.json({ success: true, message: 'AWB not mapped' });
      return;
    }

    // Map Shiprocket status to GymNation OrderStatus
    let orderStatus: OrderStatus | undefined;
    if (currentStatus.includes('TRANSIT') || currentStatus.includes('PICKED UP')) {
      orderStatus = OrderStatus.SHIPPED;
    } else if (currentStatus.includes('OUT FOR DELIVERY')) {
      orderStatus = OrderStatus.OUT_FOR_DELIVERY;
    } else if (currentStatus.includes('DELIVERED')) {
      orderStatus = OrderStatus.DELIVERED;
    } else if (currentStatus.includes('RTO') || currentStatus.includes('RETURN')) {
      orderStatus = OrderStatus.RETURNED;
    } else if (currentStatus.includes('CANCEL')) {
      orderStatus = OrderStatus.CANCELLED;
    }

    await prisma.shipment.update({
      where: { id: shipment.id },
      data: {
        status: currentStatus,
        events: payload,
      },
    });

    if (orderStatus && shipment.order.status !== orderStatus) {
      await prisma.order.update({
        where: { id: shipment.orderId },
        data: {
          status: orderStatus,
          notes: shipment.order.notes
            ? `${shipment.order.notes}\n[Webhook]: Status updated to ${orderStatus} via Shiprocket tracking (${currentStatus})`
            : `[Webhook]: Status updated to ${orderStatus} via Shiprocket tracking (${currentStatus})`,
        },
      });
      logger.info(`Order ${shipment.order.orderNumber} updated to ${orderStatus} via Shiprocket webhook`);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (err) {
    next(err);
  }
};
