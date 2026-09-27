import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface AuthRequest extends Request {
  user?: { sub: string; email: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Not authenticated. Please log in.' });
  }
  try {
    req.user = jwt.verify(token, config.jwtSecret) as { sub: string; email: string };
    next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Invalid or expired token. Please log in again.' });
  }
}

export function signToken(sub: string, email: string): string {
  return jwt.sign({ sub, email }, config.jwtSecret, { expiresIn: '30d' });
}
