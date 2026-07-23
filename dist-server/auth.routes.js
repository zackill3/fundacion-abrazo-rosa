"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const bcryptjs_1 = tslib_1.__importDefault(require("bcryptjs"));
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const database_js_1 = require("./database.js");
const config_js_1 = require("./config.js");
const auth_middleware_js_1 = require("./auth.middleware.js");
const router = (0, express_1.Router)();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function issueToken(user) {
    return jsonwebtoken_1.default.sign(user, config_js_1.config.jwtSecret, { expiresIn: config_js_1.config.jwtExpiresIn });
}
router.post('/register', async (request, response, next) => {
    try {
        const name = String(request.body?.name ?? '').trim();
        const email = String(request.body?.email ?? '').trim().toLowerCase();
        const password = String(request.body?.password ?? '');
        const signupCode = String(request.body?.signupCode ?? '');
        if (name.length < 2 || !emailPattern.test(email) || password.length < 8) {
            response.status(422).json({ message: 'Nombre, correo o contraseña no válidos. La contraseña debe tener mínimo 8 caracteres.' });
            return;
        }
        if (signupCode !== config_js_1.config.adminSignupCode) {
            response.status(403).json({ message: 'El código de registro administrativo no es válido.' });
            return;
        }
        const [existing] = await database_js_1.pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
        if (existing.length) {
            response.status(409).json({ message: 'Ya existe una cuenta con este correo.' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const [result] = await database_js_1.pool.execute('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, passwordHash, 'admin']);
        const user = { id: result.insertId, name, email, role: 'admin' };
        response.status(201).json({ token: issueToken(user), user });
    }
    catch (error) {
        next(error);
    }
});
router.post('/login', async (request, response, next) => {
    try {
        const email = String(request.body?.email ?? '').trim().toLowerCase();
        const password = String(request.body?.password ?? '');
        const [rows] = await database_js_1.pool.execute('SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ? LIMIT 1', [email]);
        const record = rows[0];
        if (!record || !record.is_active || !(await bcryptjs_1.default.compare(password, record.password_hash))) {
            response.status(401).json({ message: 'Correo o contraseña incorrectos.' });
            return;
        }
        const user = { id: record.id, name: record.name, email: record.email, role: record.role };
        response.json({ token: issueToken(user), user });
    }
    catch (error) {
        next(error);
    }
});
router.get('/me', auth_middleware_js_1.requireAuth, (request, response) => response.json({ user: request.user }));
router.patch('/me', auth_middleware_js_1.requireAuth, auth_middleware_js_1.requireAdmin, async (request, response, next) => {
    try {
        const name = String(request.body?.name ?? '').trim();
        const email = String(request.body?.email ?? '').trim().toLowerCase();
        if (name.length < 2 || !emailPattern.test(email)) {
            response.status(422).json({ message: 'Nombre o correo no válidos.' });
            return;
        }
        await database_js_1.pool.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, request.user.id]);
        const user = { ...request.user, name, email };
        response.json({ token: issueToken(user), user });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
