import { Router } from 'express';
import customerAuthRoutes from './customerAuthRoutes.js';
import adminAuthRoutes from './adminAuthRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import mediaRoutes from './mediaRoutes.js';
import cmsRoutes from './cmsRoutes.js';
import storeRoutes from './storeRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import orderRoutes from './orderRoutes.js';
import crmRoutes from './crmRoutes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'GymNation API v1 is operational',
    timestamp: new Date().toISOString(),
  });
});

// Auth
router.use('/auth', customerAuthRoutes);
router.use('/admin/auth', adminAuthRoutes);

// Settings
router.use('/settings', settingsRoutes);

// Media
router.use('/admin/media', mediaRoutes);

// CMS Modules (Home, Hero, Marquee, Pages, Why Us, Stats, Gallery, Plans, Testimonials, FAQ)
router.use('/', cmsRoutes);

// Store (Categories, Products, Variants, Inventory)
router.use('/', storeRoutes);

// Checkout (Cart, Coupons, Orders, Razorpay, Webhooks)
router.use('/', checkoutRoutes);

// Orders & Shipping (Shiprocket, Admin Orders, Invoices)
router.use('/', orderRoutes);

// CRM (Leads, Newsletter, Memberships, Walk-in, Dashboard Analytics, Audit Logs)
router.use('/', crmRoutes);

export default router;
