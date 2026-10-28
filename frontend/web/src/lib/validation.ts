/**
 * Client-side security sanitization & form validation suite
 * Protects frontend against XSS injections, malformed payloads, and invalid submission states.
 */

/**
 * Strips script tags, HTML tags, inline event handlers, and javascript: protocols.
 */
export const sanitizeInput = (val: string): string => {
  if (typeof val !== 'string') return '';
  return val
    .replace(/\0/g, '') // remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove script tags
    .replace(/<\/?(?:iframe|object|embed|applet|form|base|link|meta)\b[^>]*>/gi, '') // remove dangerous tags
    .replace(/(?:javascript|vbscript|data):/gi, '') // neutralize protocols
    .replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '') // strip event handlers
    .replace(/[<>]/g, '') // strip any residual angle brackets for pure text fields
    .trim();
};

/**
 * Validates RFC compliant email address.
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const clean = email.trim();
  if (!clean) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. athlete@gymnation.in).' };
  }
  return { isValid: true };
};

/**
 * Validates 10-digit Indian mobile numbers (starts with 6, 7, 8, or 9).
 * Accepts raw digits or numbers formatted with +91, spaces, or hyphens.
 */
export const validateIndianPhone = (phone: string): { isValid: boolean; cleanPhone: string; error?: string } => {
  const digitsOnly = phone.replace(/\D/g, '');
  // Extract last 10 digits if user prefixed with country code (91)
  const tenDigit = digitsOnly.length > 10 && digitsOnly.startsWith('91')
    ? digitsOnly.slice(-10)
    : digitsOnly;

  if (!tenDigit) {
    return { isValid: false, cleanPhone: '', error: 'Phone number is required.' };
  }

  if (tenDigit.length !== 10) {
    return { isValid: false, cleanPhone: tenDigit, error: 'Phone number must be exactly 10 digits.' };
  }

  if (!/^[6-9]/.test(tenDigit)) {
    return { isValid: false, cleanPhone: tenDigit, error: 'Phone number must start with 6, 7, 8, or 9.' };
  }

  return { isValid: true, cleanPhone: tenDigit };
};

/**
 * Validates passwords: minimum 6 characters (recommended 8+ with alphanumeric).
 */
export const validatePassword = (password: string, minLength: number = 6): { isValid: boolean; error?: string } => {
  if (!password || password.trim().length === 0) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters.` };
  }
  return { isValid: true };
};

/**
 * Validates Indian postal codes (6 digits, non-zero start).
 */
export const validatePincode = (pincode: string): { isValid: boolean; error?: string } => {
  const clean = pincode.trim().replace(/\D/g, '');
  if (clean.length !== 6 || !/^[1-9]\d{5}$/.test(clean)) {
    return { isValid: false, error: 'Please enter a valid 6-digit Indian PIN code (e.g. 395009).' };
  }
  return { isValid: true };
};

/**
 * Validates person or business name (min 2 chars, max 60 chars).
 */
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(name);
  if (!sanitized || sanitized.length < 2) {
    return { isValid: false, error: 'Please enter your full name (minimum 2 characters).' };
  }
  if (sanitized.length > 60) {
    return { isValid: false, error: 'Name cannot exceed 60 characters.' };
  }
  return { isValid: true };
};
