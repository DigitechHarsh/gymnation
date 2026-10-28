import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Sanitizes a single string to strip dangerous HTML, script tags,
 * and malicious event handlers to prevent XSS and injection attacks.
 */
export const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return str;

  return str
    // Remove null bytes
    .replace(/\0/g, '')
    // Strip <script>...</script> tags entirely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip <iframe>, <object>, <embed>, <applet>, <form> tags
    .replace(/<\/?(?:iframe|object|embed|applet|form|base|link|meta)\b[^>]*>/gi, '')
    // Neutralize javascript: and vbscript: URIs
    .replace(/(?:javascript|vbscript|data):/gi, '')
    // Neutralize inline event handlers like onerror=, onload=, onclick=
    .replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
};

/**
 * Recursively sanitizes any JavaScript object, array, or primitive.
 * Also defends against Prototype Pollution by blocking __proto__, constructor, and prototype.
 */
export const sanitizePayload = (value: any): any => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizePayload(item));
  }

  if (typeof value === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      // Prevent Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      cleanObj[key] = sanitizePayload(val);
    }
    return cleanObj;
  }

  return value;
};

/**
 * Express middleware that sanitizes req.body, req.query, and req.params
 * before passing control to routers or controllers.
 */
export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizePayload(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizePayload(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizePayload(req.params);
  }
  next();
};

/**
 * Strict Rate Limiter for Authentication endpoints (login, register).
 * Defends against brute-force password guessing and credential stuffing.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 15, // max 15 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes for your security.',
  },
});

/**
 * Strict Rate Limiter for Sensitive Operations (Checkout, Coupon code brute force, Lead spam).
 */
export const sensitiveOpsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 30, // max 30 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Operation limit reached. Please wait a moment before trying again.',
  },
});
