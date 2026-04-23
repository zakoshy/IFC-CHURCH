import DOMPurify from 'dompurify';
import xss from 'xss';

/**
 * Sanitizes HTML content for the client-side
 */
export function sanitizeClientHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

/**
 * Sanitizes plain text to prevent XSS (useful for server-side or non-HTML contexts)
 */
export function sanitizeText(text: string): string {
  return xss(text);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Simple honeypot check for bots
 */
export function isBot(honeypotValue: string): boolean {
  return honeypotValue.length > 0;
}
