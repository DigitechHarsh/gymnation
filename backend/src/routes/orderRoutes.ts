import { Router } from 'express';
import {
  checkShippingServiceability,
  listAdminOrders,
  getAdminOrderDetail,
  updateAdminOrderStatus,
  dispatchShiprocketOrder,
  scheduleOrderPickup,
  cancelAdminOrder,
  refundAdminOrder,
  addAdminOrderNote,
  generateOrderInvoiceHtml,
  shiprocketWebhook,
} from '../controllers/orderController.js';
import { requireAdminAuth, requireRole } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validate.js';
import {
  serviceabilitySchema,
  orderStatusUpdateSchema,
  createShipmentSchema,
  refundOrderSchema,
  addOrderNoteSchema,
} from '../validators/orderValidators.js';
import { AdminRole } from '@prisma/client';

const orderRouter = Router();

// ================= PUBLIC SHIPPING SERVICEABILITY =================
orderRouter.post(
  '/shipping/serviceability',
  validateBody(serviceabilitySchema),
  checkShippingServiceability
);

// ================= SHIPROCKET WEBHOOK =================
orderRouter.post('/webhooks/shiprocket', shiprocketWebhook);

// ================= ADMIN ORDER MANAGEMENT =================
const staffGuard = [requireAdminAuth, requireRole(AdminRole.SUPER_ADMIN, AdminRole.MANAGER, AdminRole.STAFF)];
const managerGuard = [requireAdminAuth, requireRole(AdminRole.SUPER_ADMIN, AdminRole.MANAGER)];

// List & view orders
orderRouter.get('/admin/orders', ...staffGuard, listAdminOrders);
orderRouter.get('/admin/orders/:id', ...staffGuard, getAdminOrderDetail);
orderRouter.get('/admin/orders/:id/invoice', generateOrderInvoiceHtml);

// Order status & operations
orderRouter.patch(
  '/admin/orders/:id/status',
  ...managerGuard,
  validateBody(orderStatusUpdateSchema),
  updateAdminOrderStatus
);

orderRouter.post(
  '/admin/orders/:id/shiprocket',
  ...managerGuard,
  validateBody(createShipmentSchema),
  dispatchShiprocketOrder
);

orderRouter.post(
  '/admin/orders/:id/pickup',
  ...managerGuard,
  scheduleOrderPickup
);

orderRouter.post(
  '/admin/orders/:id/cancel',
  ...managerGuard,
  cancelAdminOrder
);

orderRouter.post(
  '/admin/orders/:id/refund',
  ...managerGuard,
  validateBody(refundOrderSchema),
  refundAdminOrder
);

orderRouter.post(
  '/admin/orders/:id/notes',
  ...staffGuard,
  validateBody(addOrderNoteSchema),
  addAdminOrderNote
);

export default orderRouter;
