import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

interface AuditLogParams {
  adminUserId?: string;
  action: string;
  entity: string;
  entityId?: string;
  diff?: any;
  ip?: string;
}

export const recordAuditLog = async (params: AuditLogParams) => {
  try {
    await prisma.auditLog.create({
      data: {
        adminUserId: params.adminUserId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        diff: params.diff || null,
        ip: params.ip || null,
      },
    });
  } catch (error) {
    logger.error(error, `Failed to create audit log for ${params.entity}:${params.action}`);
  }
};
