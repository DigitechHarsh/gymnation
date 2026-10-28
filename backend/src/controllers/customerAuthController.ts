import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { sendSuccess, AppError } from '../utils/response.js';
import {
  signCustomerAccessToken,
  signCustomerRefreshToken,
  verifyRefreshToken,
  CustomerJwtPayload,
} from '../utils/jwt.js';
import { AuthenticatedCustomerRequest } from '../middlewares/authMiddleware.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const registerCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, password } = req.body;

    const existing = await prisma.customer.findUnique({
      where: { email },
    });
    if (existing) {
      throw new AppError('An account with this email already exists', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    // Create empty cart for customer
    await prisma.cart.create({
      data: { customerId: customer.id },
    });

    const payload: CustomerJwtPayload = {
      customerId: customer.id,
      email: customer.email,
    };

    const accessToken = signCustomerAccessToken(payload);
    const refreshToken = signCustomerRefreshToken(payload);

    res.cookie('customer_refresh_token', refreshToken, COOKIE_OPTIONS);

    return sendSuccess(res, {
      customer,
      accessToken,
    }, 'Registration successful', undefined, 201);
  } catch (error) {
    next(error);
  }
};

// Pre-computed dummy hash to prevent timing attacks and account enumeration
const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

export const loginCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer || !customer.passwordHash) {
      // Execute dummy compare to ensure constant-time response and prevent account enumeration
      await bcrypt.compare(password, DUMMY_HASH);
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const payload: CustomerJwtPayload = {
      customerId: customer.id,
      email: customer.email,
    };

    const accessToken = signCustomerAccessToken(payload);
    const refreshToken = signCustomerRefreshToken(payload);

    res.cookie('customer_refresh_token', refreshToken, COOKIE_OPTIONS);

    return sendSuccess(res, {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      accessToken,
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const refreshCustomerToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.customer_refresh_token;
    if (!token) {
      throw new AppError('Missing refresh token', 401);
    }

    const decoded = verifyRefreshToken<CustomerJwtPayload>(token);
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.customerId },
      select: { id: true, name: true, email: true, phone: true },
    });

    if (!customer) {
      throw new AppError('Customer not found', 401);
    }

    const newAccessToken = signCustomerAccessToken({
      customerId: customer.id,
      email: customer.email,
    });

    return sendSuccess(res, {
      accessToken: newAccessToken,
      customer,
    }, 'Token refreshed');
  } catch (error: any) {
    next(new AppError('Invalid or expired refresh token', 401));
  }
};

export const logoutCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('customer_refresh_token', COOKIE_OPTIONS);
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getCustomerProfile = async (req: AuthenticatedCustomerRequest, res: Response) => {
  return sendSuccess(res, req.customer, 'Customer profile retrieved');
};

// Customer Addresses CRUD
export const listCustomerAddresses = async (req: AuthenticatedCustomerRequest, res: Response, next: NextFunction) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { customerId: req.customer!.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return sendSuccess(res, addresses, 'Customer addresses retrieved');
  } catch (error) {
    next(error);
  }
};

export const addCustomerAddress = async (req: AuthenticatedCustomerRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, line1, line2, city, state, pincode, country, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId: req.customer!.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        customerId: req.customer!.id,
        name,
        phone,
        line1,
        line2,
        city,
        state,
        pincode,
        country: country || 'India',
        isDefault: !!isDefault,
      },
    });

    return sendSuccess(res, address, 'Address added', undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCustomerAddress = async (req: AuthenticatedCustomerRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { name, phone, line1, line2, city, state, pincode, country, isDefault } = req.body;

    const existing = await prisma.address.findFirst({
      where: { id, customerId: req.customer!.id },
    });
    if (!existing) {
      throw new AppError('Address not found', 404);
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId: req.customer!.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        name,
        phone,
        line1,
        line2,
        city,
        state,
        pincode,
        country,
        ...(typeof isDefault === 'boolean' && { isDefault }),
      },
    });

    return sendSuccess(res, updated, 'Address updated');
  } catch (error) {
    next(error);
  }
};

export const deleteCustomerAddress = async (req: AuthenticatedCustomerRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.address.findFirst({
      where: { id, customerId: req.customer!.id },
    });
    if (!existing) {
      throw new AppError('Address not found', 404);
    }

    await prisma.address.delete({ where: { id } });
    return sendSuccess(res, null, 'Address deleted');
  } catch (error) {
    next(error);
  }
};
