import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import authRoutes from './auth.routes.js';
import { config } from './config.js';
import { verifyDatabase } from './database.js';
import { runMigrations } from './migrate.js';

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: config.frontendOrigin, credentials: false }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

app.use((_request, response) => response.status(404).json({ message: 'Ruta no encontrada.' }));
app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  console.error(error);
  response.status(500).json({ message: 'Ocurrió un error interno.' });
});

async function start(): Promise<void> {
  await verifyDatabase();
  await runMigrations();
  app.listen(config.port, () => console.log(`API disponible en http://localhost:${config.port}`));
}

start().catch(error => { console.error('No fue posible iniciar la API:', error); process.exitCode = 1; });
