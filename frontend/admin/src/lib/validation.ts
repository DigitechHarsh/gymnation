/**
 * Admin Console Client-side Security & Input Sanitization
 */

export const sanitizeInput = (val: string): string => {
  if (typeof val !== 'string') return '';
  return val
    .replace(/\0/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\/?(?:iframe|object|embed|applet|form|base|link|meta)\b[^>]*>/gi, '')
    .replace(/(?:javascript|vbscript|data):/gi, '')
    .replace(/\s+on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .trim();
};

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const clean = email.trim();
  if (!clean) return { isValid: false, error: 'Email is required.' };
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!regex.test(clean)) return { isValid: false, error: 'Invalid email address.' };
  return { isValid: true };
};

export const validateIndianPhone = (phone: string): { isValid: boolean; cleanPhone: string; error?: string } => {
  const digitsOnly = phone.replace(/\D/g, '');
  const tenDigit = digitsOnly.length > 10 && digitsOnly.startsWith('91') ? digitsOnly.slice(-10) : digitsOnly;
  if (!tenDigit || tenDigit.length !== 10 || !/^[6-9]/.test(tenDigit)) {
    return { isValid: false, cleanPhone: tenDigit, error: 'Enter valid 10-digit Indian phone (starts with 6-9).' };
  }
  return { isValid: true, cleanPhone: tenDigit };
};
