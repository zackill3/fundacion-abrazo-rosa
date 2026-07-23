import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from './database.js';
import { config } from './config.js';
import { requireAdmin, requireAuth } from './auth.middleware.js';
import type { AuthenticatedRequest, AuthUser } from './types.js';

interface UserRow extends RowDataPacket { id: number; name: string; email: string; password_hash: string; role: 'admin' | 'user'; is_active: number; }
const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function issueToken(user: AuthUser): string {
  return jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as SignOptions);
}

router.post('/register', async (request, response, next) => {
  try {
    const name = String(request.body?.name ?? '').trim();
    const email = String(request.body?.email ?? '').trim().toLowerCase();
    const password = String(request.body?.password ?? '');
    const signupCode = String(request.body?.signupCode ?? '');
    if (name.length < 2 || !emailPattern.test(email) || password.length < 8) { response.status(422).json({ message: 'Nombre, correo o contraseña no válidos. La contraseña debe tener mínimo 8 caracteres.' }); return; }
    if (signupCode !== config.adminSignupCode) { response.status(403).json({ message: 'El código de registro administrativo no es válido.' }); return; }
    const [existing] = await pool.execute<UserRow[]>('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length) { response.status(409).json({ message: 'Ya existe una cuenta con este correo.' }); return; }
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute<ResultSetHeader>('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, passwordHash, 'admin']);
    const user: AuthUser = { id: result.insertId, name, email, role: 'admin' };
    response.status(201).json({ token: issueToken(user), user });
  } catch (error) { next(error); }
});

router.post('/login', async (request, response, next) => {
  try {
    const email = String(request.body?.email ?? '').trim().toLowerCase();
    const password = String(request.body?.password ?? '');
    const [rows] = await pool.execute<UserRow[]>('SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ? LIMIT 1', [email]);
    const record = rows[0];
    if (!record || !record.is_active || !(await bcrypt.compare(password, record.password_hash))) { response.status(401).json({ message: 'Correo o contraseña incorrectos.' }); return; }
    const user: AuthUser = { id: record.id, name: record.name, email: record.email, role: record.role };
    response.json({ token: issueToken(user), user });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, (request: AuthenticatedRequest, response) => response.json({ user: request.user }));

router.patch('/me', requireAuth, requireAdmin, async (request: AuthenticatedRequest, response, next) => {
  try {
    const name = String(request.body?.name ?? '').trim();
    const email = String(request.body?.email ?? '').trim().toLowerCase();
    if (name.length < 2 || !emailPattern.test(email)) { response.status(422).json({ message: 'Nombre o correo no válidos.' }); return; }
    await pool.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, request.user!.id]);
    const user: AuthUser = { ...request.user!, name, email };
    response.json({ token: issueToken(user), user });
  } catch (error) { next(error); }
});

export default router;
