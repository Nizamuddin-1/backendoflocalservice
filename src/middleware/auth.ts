import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { AuthRequest, AuthPayload, TokenPair } from '../types';

function verifyToken(token: string, secret: string): AuthPayload {
  return jwt.verify(token, secret) as AuthPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { message: 'Access denied. No token provided.', status: 401 } });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token, env.jwtSecret);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: { message: 'Invalid or expired token.', status: 401 } });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
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
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Authentication required.', status: 401 } });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: { message: 'Insufficient permissions.', status: 403 } });
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
  return bcrypt.hash(token, 10);
}

export async function compareToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}

export function generateTokenPair(payload: AuthPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}
