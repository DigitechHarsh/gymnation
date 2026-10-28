import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { sendSuccess, AppError } from '../utils/response.js';
import {
  signAdminAccessToken,
  signAdminRefreshToken,
  verifyRefreshToken,
  AdminJwtPayload,
} from '../utils/jwt.js';
import { recordAuditLog } from '../services/auditService.js';
import { AuthenticatedAdminRequest } from '../middlewares/authMiddleware.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Pre-computed dummy hash to prevent timing attacks and account enumeration
const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      // Execute dummy compare to ensure constant-time response and prevent account enumeration
      await bcrypt.compare(password, DUMMY_HASH);
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: AdminJwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAdminAccessToken(payload);
    const refreshToken = signAdminRefreshToken(payload);

    res.cookie('admin_refresh_token', refreshToken, COOKIE_OPTIONS);

    await recordAuditLog({
      adminUserId: user.id,
      action: 'LOGIN',
      entity: 'ADMIN_USER',
      entityId: user.id,
      ip: req.ip,
    });

    return sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const refreshAdminToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.admin_refresh_token;
    if (!token) {
      throw new AppError('Missing refresh token', 401);
    }

    const decoded = verifyRefreshToken<AdminJwtPayload>(token);
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid refresh token or inactive account', 401);
    }

    const payload: AdminJwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = signAdminAccessToken(payload);

    return sendSuccess(res, {
      accessToken: newAccessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, 'Token refreshed');
  } catch (error: any) {
    next(new AppError('Invalid or expired refresh token', 401));
  }
};

export const logoutAdmin = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('admin_refresh_token', COOKIE_OPTIONS);
    if (req.adminUser) {
      await recordAuditLog({
        adminUserId: req.adminUser.id,
        action: 'LOGOUT',
        entity: 'ADMIN_USER',
        entityId: req.adminUser.id,
        ip: req.ip,
      });
    }
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (req: AuthenticatedAdminRequest, res: Response) => {
  return sendSuccess(res, req.adminUser, 'Profile retrieved');
};

// Admin User Management (SUPER_ADMIN only)
export const listAdminUsers = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, users, 'Admin users list retrieved');
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await prisma.adminUser.findUnique({
      where: { email },
    });
    if (existing) {
      throw new AppError('Email is already registered', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'CREATE',
      entity: 'ADMIN_USER',
      entityId: newUser.id,
      diff: { name, email, role },
      ip: req.ip,
    });

    return sendSuccess(res, newUser, 'Admin user created successfully', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateAdminUser = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { name, email, password, role, isActive } = req.body;

    const existing = await prisma.adminUser.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('User not found', 404);
    }

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (role) dataToUpdate.role = role;
    if (typeof isActive === 'boolean') dataToUpdate.isActive = isActive;
    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'UPDATE',
      entity: 'ADMIN_USER',
      entityId: id,
      diff: dataToUpdate,
      ip: req.ip,
    });

    return sendSuccess(res, updated, 'Admin user updated');
  } catch (error) {
    next(error);
  }
};

export const deleteAdminUser = async (req: AuthenticatedAdminRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    if (req.adminUser?.id === id) {
      throw new AppError('Cannot delete your own account', 400);
    }

    await prisma.adminUser.delete({
      where: { id },
    });

    await recordAuditLog({
      adminUserId: req.adminUser?.id,
      action: 'DELETE',
      entity: 'ADMIN_USER',
      entityId: id,
      ip: req.ip,
    });

    return sendSuccess(res, null, 'Admin user deleted');
  } catch (error) {
    next(error);
  }
};
