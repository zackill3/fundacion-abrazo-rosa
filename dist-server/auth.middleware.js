"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const config_js_1 = require("./config.js");
function requireAuth(request, response, next) {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
        response.status(401).json({ message: 'Sesión requerida.' });
        return;
    }
    try {
        request.user = jsonwebtoken_1.default.verify(token, config_js_1.config.jwtSecret);
        next();
    }
    catch {
        response.status(401).json({ message: 'La sesión no es válida o expiró.' });
    }
}
function requireAdmin(request, response, next) {
    if (request.user?.role !== 'admin') {
        response.status(403).json({ message: 'Acceso exclusivo para administradores.' });
        return;
    }
    next();
}
