import type { Request } from 'express';

export interface AuthUser { id: number; name: string; email: string; role: 'admin' | 'user'; }
export interface AuthenticatedRequest extends Request { user?: AuthUser; }
