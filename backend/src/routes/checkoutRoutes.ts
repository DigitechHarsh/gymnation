import { Router } from 'express';
import {
  validateCartEndpoint,
  getCustomerCart,
  addCustomerCartItem,
  updateCustomerCartItem,
  removeCustomerCartItem,
  clearCustomerCart,
} from '../controllers/checkout/cartController.js';
import {
  applyCouponEndpoint,
  listAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
} from '../controllers/checkout/couponController.js';
import {
  createOrderEndpoint,
  verifyPaymentEndpoint,
  razorpayWebhookEndpoint,
  trackOrderEndpoint,
} from '../controllers/checkout/checkoutController.js';
import { requireAdminAuth, requireRole, requireCustomerAuth, optionalCustomerAuth } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validate.js';
import { sensitiveOpsRateLimiter } from '../middlewares/security.js';
import {
  validateCartSchema,
  applyCouponSchema,
  createOrderSchema,
  verifyPaymentSchema,
  couponCrudSchema,
} from '../validators/checkout/checkoutValidators.js';
import { AdminRole } from '@prisma/client';

const checkoutRouter = Router();

// ================= PUBLIC CART & COUPON ROUTES =================
checkoutRouter.post('/cart/validate', validateBody(validateCartSchema), validateCartEndpoint);
checkoutRouter.post('/coupons/apply', sensitiveOpsRateLimiter, validateBody(applyCouponSchema), applyCouponEndpoint);

// ================= CHECKOUT & RAZORPAY ROUTES =================
checkoutRouter.post(
  '/checkout/create-order',
  sensitiveOpsRateLimiter,
  optionalCustomerAuth,
  validateBody(createOrderSchema),
  createOrderEndpoint
);

checkoutRouter.post(
  '/checkout/verify-payment',
  validateBody(verifyPaymentSchema),
  verifyPaymentEndpoint
);

// Razorpay Webhooks (uses raw body for signature verification)
checkoutRouter.post('/webhooks/razorpay', razorpayWebhookEndpoint);

// Public Order Tracking
checkoutRouter.get('/orders/track', trackOrderEndpoint);

// ================= LOGGED-IN CUSTOMER CART ROUTES =================
checkoutRouter.get('/cart', requireCustomerAuth, getCustomerCart);
checkoutRouter.post('/cart/items', requireCustomerAuth, addCustomerCartItem);
checkoutRouter.put('/cart/items/:id', requireCustomerAuth, updateCustomerCartItem);
checkoutRouter.delete('/cart/items/:id', requireCustomerAuth, removeCustomerCartItem);
checkoutRouter.delete('/cart', requireCustomerAuth, clearCustomerCart);

// ================= ADMIN COUPONS ROUTES (SUPER_ADMIN, MANAGER) =================
const adminGuard = [requireAdminAuth, requireRole(AdminRole.SUPER_ADMIN, AdminRole.MANAGER)];

checkoutRouter.get('/admin/coupons', ...adminGuard, listAdminCoupons);
checkoutRouter.post('/admin/coupons', ...adminGuard, validateBody(couponCrudSchema), createAdminCoupon);
checkoutRouter.put('/admin/coupons/:id', ...adminGuard, validateBody(couponCrudSchema), updateAdminCoupon);
checkoutRouter.delete('/admin/coupons/:id', ...adminGuard, deleteAdminCoupon);

export default checkoutRouter;
