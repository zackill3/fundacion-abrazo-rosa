"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const auth_routes_js_1 = tslib_1.__importDefault(require("./auth.routes.js"));
const config_js_1 = require("./config.js");
const database_js_1 = require("./database.js");
const migrate_js_1 = require("./migrate.js");
const app = (0, express_1.default)();
app.disable('x-powered-by');
app.use((0, cors_1.default)({ origin: config_js_1.config.frontendOrigin, credentials: false }));
app.use(express_1.default.json({ limit: '100kb' }));
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/auth', auth_routes_js_1.default);
app.use((_request, response) => response.status(404).json({ message: 'Ruta no encontrada.' }));
app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ message: 'Ocurrió un error interno.' });
});
async function start() {
    await (0, database_js_1.verifyDatabase)();
    await (0, migrate_js_1.runMigrations)();
    app.listen(config_js_1.config.port, () => console.log(`API disponible en http://localhost:${config_js_1.config.port}`));
}
start().catch(error => { console.error('No fue posible iniciar la API:', error); process.exitCode = 1; });
