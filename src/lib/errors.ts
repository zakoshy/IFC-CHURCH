export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export class ChurchError extends Error {
  code: string;
  details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'ChurchError';
    this.code = code;
    this.details = details;
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Handles Supabase errors and converts them to structured ChurchErrors
 */
export function handleSupabaseError(error: any): ChurchError {
  console.error('Supabase Error:', error);
  
  if (error.code === '23505') {
    return new ChurchError('ALREADY_EXISTS', 'This record already exists.', error);
  }
  
  if (error.code === '42501') {
    return new ChurchError('PERMISSION_DENIED', 'You do not have permission to perform this action.', error);
  }

  return new ChurchError(
    error.code || 'UNKNOWN_ERROR',
    error.message || 'An unexpected error occurred.',
    error.details || error.hint
  );
}

/**
 * User-friendly error messages based on codes
 */
export function getFriendlyMessage(error: any): string {
  if (error instanceof ChurchError) {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        return 'Access denied. Please check if you have the right permissions or are signed in.';
      case 'ALREADY_EXISTS':
        return 'It looks like this information is already in the system.';
      case 'rate-limit':
        return 'Too many requests. Please take a small break and try again in a minute.';
      default:
        return error.message;
    }
  }
  return error?.message || 'Something went wrong. Please try again.';
}
