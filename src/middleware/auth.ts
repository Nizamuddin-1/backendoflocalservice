import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { AuthRequest, AuthPayload, TokenPair } from '../types';

function verifyToken(token: string, secret: string): AuthPayload {
  return jwt.verify(token, secret) as AuthPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Access denied. No token provided.' },
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token, env.jwtSecret);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      data: null,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token.' },
    });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyToken(token, env.jwtSecret);
        req.user = decoded;
      } catch {
        // Token invalid, continue without auth
      }
    }

    next();
  } catch {
    next();
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        data: null,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        data: null,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions.' },
      });
      return;
    }

    next();
  };
}

export function generateAccessToken(payload: AuthPayload): string {
  const options: jwt.SignOptions = { expiresIn: env.jwtAccessExpiry as any };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function generateRefreshToken(payload: AuthPayload): string {
  const options: jwt.SignOptions = { expiresIn: env.jwtRefreshExpiry as any };
  return jwt.sign(payload, env.jwtRefreshSecret, options);
}

export function verifyRefreshToken(token: string): AuthPayload {
  return verifyToken(token, env.jwtRefreshSecret);
}

export async function hashToken(token: string): Promise<string> {
  try {
    return await bcrypt.hash(token, 10);
  } catch (error) {
    throw new AppError('Failed to hash token', 500);
  }
}

export async function compareToken(token: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(token, hash);
  } catch (error) {
    throw new AppError('Failed to compare token', 500);
  }
}

export function generateTokenPair(payload: AuthPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
