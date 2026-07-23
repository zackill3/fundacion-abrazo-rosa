"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.verifyDatabase = verifyDatabase;
const tslib_1 = require("tslib");
const promise_1 = tslib_1.__importDefault(require("mysql2/promise"));
const config_js_1 = require("./config.js");
exports.pool = promise_1.default.createPool({
    ...config_js_1.config.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
});
async function verifyDatabase() {
    const connection = await exports.pool.getConnection();
    try {
        await connection.ping();
    }
    finally {
        connection.release();
    }
}
