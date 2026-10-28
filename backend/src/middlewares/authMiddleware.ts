import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AdminJwtPayload, CustomerJwtPayload } from '../utils/jwt.js';
import { prisma } from '../config/db.js';
import { AppError } from '../utils/response.js';
import { AdminRole } from '@prisma/client';

export interface AuthenticatedAdminRequest extends Request {
  adminUser?: {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    isActive: boolean;
  };
}

export interface AuthenticatedCustomerRequest extends Request {
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

export const requireAdminAuth = async (
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: Missing or invalid token', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken<AdminJwtPayload>(token);

    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('Unauthorized: User account not found or inactive', 401);
    }

    req.adminUser = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired', 401));
    } else {
      next(new AppError(error.message || 'Authentication failed', error.statusCode || 401));
    }
  }
};

export const requireRole = (...allowedRoles: AdminRole[]) => {
  return (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!allowedRoles.includes(req.adminUser.role)) {
      return next(new AppError('Forbidden: Insufficient privileges', 403));
    }

    next();
  };
};

export const requireCustomerAuth = async (
  req: AuthenticatedCustomerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: Missing token', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken<CustomerJwtPayload>(token);

    const customer = await prisma.customer.findUnique({
      where: { id: decoded.customerId },
      select: { id: true, name: true, email: true, phone: true },
    });

    if (!customer) {
      throw new AppError('Unauthorized: Customer not found', 401);
    }

    req.customer = customer;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired', 401));
    } else {
      next(new AppError(error.message || 'Authentication failed', error.statusCode || 401));
    }
  }
};

export const optionalCustomerAuth = async (
  req: AuthenticatedCustomerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken<CustomerJwtPayload>(token);
      const customer = await prisma.customer.findUnique({
        where: { id: decoded.customerId },
        select: { id: true, name: true, email: true, phone: true },
      });
      if (customer) {
        req.customer = customer;
      }
    }
    next();
  } catch {
    // Optional auth silently continues
    next();
  }
};
