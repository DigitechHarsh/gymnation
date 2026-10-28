import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AdminJwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface CustomerJwtPayload {
  customerId: string;
  email: string;
}

export const signAdminAccessToken = (payload: AdminJwtPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

export const signAdminRefreshToken = (payload: AdminJwtPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const signCustomerAccessToken = (payload: CustomerJwtPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

export const signCustomerRefreshToken = (payload: CustomerJwtPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = <T>(token: string): T => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as T;
};

export const verifyRefreshToken = <T>(token: string): T => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as T;
};
