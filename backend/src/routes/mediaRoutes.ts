import { Router } from 'express';
import {
  getUploadSignature,
  recordMediaUpload,
  listMedia,
  checkMediaUsageEndpoint,
  deleteMedia,
} from '../controllers/mediaController.js';
import { requireAdminAuth, requireRole } from '../middlewares/authMiddleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();

// Media routes for Admin Panel (SUPER_ADMIN and MANAGER)
router.get(
  '/sign',
  requireAdminAuth,
  requireRole(AdminRole.SUPER_ADMIN, AdminRole.MANAGER),
  getUploadSignature
);

router.post(
  '/record',
  requireAdminAuth,
  requireRole(AdminRole.SUPER_ADMIN, AdminRole.MANAGER),
  recordMediaUpload
);

router.get(
  '/',
  requireAdminAuth,
  requireRole(AdminRole.SUPER_ADMIN, AdminRole.MANAGER),
  listMedia
);

router.get(
  '/check-usage/:id',
  requireAdminAuth,
  requireRole(AdminRole.SUPER_ADMIN, AdminRole.MANAGER),
  checkMediaUsageEndpoint
);

router.delete(
  '/:id',
  requireAdminAuth,
  requireRole(AdminRole.SUPER_ADMIN, AdminRole.MANAGER),
  deleteMedia
);

export default router;
