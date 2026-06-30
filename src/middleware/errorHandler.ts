import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

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

function handleMongooseError(err: Error): AppError {
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: (e as mongoose.Error.ValidatorError).path,
      message: e.message,
    }));
    return new AppError('Validation failed', 422, details);
  }

  if (err instanceof mongoose.Error.CastError) {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  if ((err as any).code === 11000) {
    const keyValue = (err as any).keyValue || {};
    const field = Object.keys(keyValue)[0] || 'field';
    return new AppError(`${field} already exists`, 409);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return new AppError('Invalid or expired token', 401);
  }

  return new AppError('Internal server error', 500);
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError && err.isOperational) {
    const response: Record<string, unknown> = {
      data: null,
      error: {
        code: getErrorCode(err.statusCode),
        message: err.message,
      },
    };
    if (err.details) {
      (response.error as Record<string, unknown>).details = err.details;
    }
    if (env.nodeEnv === 'development') {
      (response.error as Record<string, unknown>).stack = err.stack;
    }
    res.status(err.statusCode).json(response);
    return;
  }

  const mapped = handleMongooseError(err);

  const response: Record<string, unknown> = {
    data: null,
    error: {
      code: getErrorCode(mapped.statusCode),
      message: mapped.message,
    },
  };
  if (env.nodeEnv === 'development') {
    (response.error as Record<string, unknown>).stack = err.stack;
  }

  if (mapped.statusCode === 500) {
    console.error('[ERROR] Unhandled error:', err);
  }

  res.status(mapped.statusCode).json(response);
}
