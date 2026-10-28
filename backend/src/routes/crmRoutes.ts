import { Router } from 'express';
import {
  createPublicLead,
  listAdminLeads,
  updateAdminLead,
  deleteAdminLead,
  exportLeadsCsv,
} from '../controllers/crm/leadController.js';
import {
  subscribePublicEmail,
  listAdminSubscribers,
  deleteAdminSubscriber,
  exportSubscribersCsv,
} from '../controllers/crm/subscriberController.js';
import {
  purchaseOnlineMembership,
  verifyMembershipPayment,
  listAdminMemberships,
  createWalkInMember,
  extendAdminMembership,
  cancelAdminMembership,
  getMyMembershipCard,
  getMembershipCardById,
} from '../controllers/crm/membershipController.js';
import { listAdminAuditLogs } from '../controllers/admin/auditLogController.js';
import { getAdminDashboardMetrics } from '../controllers/admin/dashboardController.js';
import { requireAdminAuth, requireRole } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validate.js';
import { sensitiveOpsRateLimiter } from '../middlewares/security.js';
import {
  leadCreateSchema,
  leadUpdateSchema,
  subscriberSchema,
  membershipPurchaseOnlineSchema,
  membershipVerifyPaymentSchema,
  walkInMemberSchema,
  membershipExtendSchema,
} from '../validators/crmValidators.js';
import { AdminRole } from '@prisma/client';

const crmRouter = Router();

// ================= PUBLIC ENDPOINTS (RATE LIMITED & SANITIZED) =================
crmRouter.post('/leads', sensitiveOpsRateLimiter, validateBody(leadCreateSchema), createPublicLead);
crmRouter.post('/newsletter', sensitiveOpsRateLimiter, validateBody(subscriberSchema), subscribePublicEmail);
crmRouter.post('/membership/purchase', sensitiveOpsRateLimiter, validateBody(membershipPurchaseOnlineSchema), purchaseOnlineMembership);
crmRouter.post('/membership/verify-payment', validateBody(membershipVerifyPaymentSchema), verifyMembershipPayment);
crmRouter.get('/membership/my-card', getMyMembershipCard);

// ================= ADMIN GUARDS =================
const staffGuard = [requireAdminAuth, requireRole(AdminRole.SUPER_ADMIN, AdminRole.MANAGER, AdminRole.STAFF)];
const managerGuard = [requireAdminAuth, requireRole(AdminRole.SUPER_ADMIN, AdminRole.MANAGER)];

// Dashboard Metrics
crmRouter.get('/admin/dashboard', ...staffGuard, getAdminDashboardMetrics);

// Leads Management
crmRouter.get('/admin/leads', ...staffGuard, listAdminLeads);
crmRouter.get('/admin/leads/export/csv', ...managerGuard, exportLeadsCsv);
crmRouter.patch('/admin/leads/:id', ...staffGuard, validateBody(leadUpdateSchema), updateAdminLead);
crmRouter.delete('/admin/leads/:id', ...managerGuard, deleteAdminLead);

// Subscribers
crmRouter.get('/admin/subscribers', ...managerGuard, listAdminSubscribers);
crmRouter.get('/admin/subscribers/export/csv', ...managerGuard, exportSubscribersCsv);
crmRouter.delete('/admin/subscribers/:id', ...managerGuard, deleteAdminSubscriber);

// Memberships & Walk-in
crmRouter.get('/admin/memberships', ...staffGuard, listAdminMemberships);
crmRouter.get('/admin/memberships/:id/card', ...staffGuard, getMembershipCardById);
crmRouter.post('/admin/memberships/walk-in', ...staffGuard, validateBody(walkInMemberSchema), createWalkInMember);
crmRouter.patch('/admin/memberships/:id/extend', ...managerGuard, validateBody(membershipExtendSchema), extendAdminMembership);
crmRouter.patch('/admin/memberships/:id/cancel', ...managerGuard, cancelAdminMembership);

// Audit Logs
crmRouter.get('/admin/audit-logs', ...managerGuard, listAdminAuditLogs);

export default crmRouter;
