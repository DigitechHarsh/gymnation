import { Router } from 'express';
import {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings,
} from '../controllers/settingsController.js';
import { requireAdminAuth, requireRole } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validate.js';
import { updateSettingsSchema } from '../validators/settingsValidators.js';
import { AdminRole } from '@prisma/client';

const router = Router();

// Public endpoint
router.get('/', getPublicSettings);

// Admin endpoints
router.get(
  '/admin',
  requireAdminAuth,
  requireRole(AdminRole.SUPER_ADMIN, AdminRole.MANAGER),
  getAdminSettings
);

router.put(
  '/admin',
  requireAdminAuth,
  requireRole(AdminRole.SUPER_ADMIN),
  validateBody(updateSettingsSchema),
  updateAdminSettings
);

export default router;
