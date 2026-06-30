import { Response } from 'express';
import { AppError } from '../middleware/errorHandler';

function getErrorCode(statusCode: number): string {
  const codes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMIT_EXCEEDED',
  };
  return codes[statusCode] || 'INTERNAL_SERVER_ERROR';
}

export function handleControllerError(error: unknown, res: Response): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      data: null,
      error: {
        code: getErrorCode(error.statusCode),
        message: error.message,
      },
    });
    return;
  }

  console.error('[ERROR]', error);
  res.status(500).json({
    data: null,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
