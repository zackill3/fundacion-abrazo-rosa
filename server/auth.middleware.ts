import type { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import type { AuthenticatedRequest, AuthUser } from './types.js';

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction): void {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) { response.status(401).json({ message: 'Sesión requerida.' }); return; }
  try { request.user = jwt.verify(token, config.jwtSecret) as AuthUser; next(); }
  catch { response.status(401).json({ message: 'La sesión no es válida o expiró.' }); }
}

export function requireAdmin(request: AuthenticatedRequest, response: Response, next: NextFunction): void {
  if (request.user?.role !== 'admin') { response.status(403).json({ message: 'Acceso exclusivo para administradores.' }); return; }
  next();
}
