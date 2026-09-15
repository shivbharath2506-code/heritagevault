import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import artifactRoutes from './routes/artifactRoutes.js';
import conservationRoutes from './routes/conservationRoutes.js';
import exhibitionRoutes from './routes/exhibitionRoutes.js';
import restorationRoutes from './routes/restorationRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req: Request, res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/artifacts', artifactRoutes);
app.use('/api/conservation', conservationRoutes);
app.use('/api/exhibitions', exhibitionRoutes);
app.use('/api/restoration', restorationRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);

import path from 'path';
import fs from 'fs';

const clientDistPath = path.resolve(__dirname, '../../frontend/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: `API endpoint '${req.originalUrl}' not found` });
      return;
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root greeting fallback
  app.get('/', (req: Request, res: Response) => {
    res.json({
      app: 'HERITAGEVAULT Digital Museum Management System',
      museum: 'Government Museum Chennai',
      code: 'CHN-MUS-001',
      status: 'Running',
      version: '1.0.0',
      docs: '/api/health',
    });
  });

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: `API endpoint '${req.originalUrl}' not found` });
  });
}

// Central Error Handler
app.use(errorHandler);

// Start Server
async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🏛️  HERITAGEVAULT Backend API Server Started`);
    console.log(`📍 Museum: Government Museum Chennai (CHN-MUS-001)`);
    console.log(`🚀 Port: ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

export default app;
