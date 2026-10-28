import { Router } from 'express';
import {
  loginAdmin,
  refreshAdminToken,
  logoutAdmin,
  getAdminProfile,
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '../controllers/adminAuthController.js';
import { requireAdminAuth, requireRole } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validate.js';
import { authRateLimiter } from '../middlewares/security.js';
import {
  adminLoginSchema,
  createAdminUserSchema,
  updateAdminUserSchema,
} from '../validators/authValidators.js';
import { AdminRole } from '@prisma/client';

const router = Router();

// Public auth endpoints with brute-force rate limiter
router.post('/login', authRateLimiter, validateBody(adminLoginSchema), loginAdmin);
router.post('/refresh', refreshAdminToken);
router.post('/logout', requireAdminAuth, logoutAdmin);
router.get('/me', requireAdminAuth, getAdminProfile);

// Admin user management (SUPER_ADMIN only)
router.get('/users', requireAdminAuth, requireRole(AdminRole.SUPER_ADMIN), listAdminUsers);
router.post(
  '/users',
  requireAdminAuth,
  requireRole(AdminRole.SUPER_ADMIN),
  validateBody(createAdminUserSchema),
  createAdminUser
);
router.put(
  '/users/:id',
  requireAdminAuth,
  requireRole(AdminRole.SUPER_ADMIN),
  validateBody(updateAdminUserSchema),
  updateAdminUser
);
router.delete(
  '/users/:id',
  requireAdminAuth,
  requireRole(AdminRole.SUPER_ADMIN),
  deleteAdminUser
);

export default router;
