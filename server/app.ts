import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import authRoutes from './auth.routes.js';
import { config } from './config.js';

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

export default app;
