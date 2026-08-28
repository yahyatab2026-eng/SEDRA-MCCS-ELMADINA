import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import workOrdersRouter from './server/routes/workOrders';
import entitiesRouter from './server/routes/entities';
import analyticsRouter from './server/routes/analytics';
import aiRouter from './server/routes/ai';
import googleSyncRouter from './server/routes/googleSync';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with support for base64 images and audio notes
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Sidrah CMMS Backend API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Mount API Routers
  app.use('/api/work-orders', workOrdersRouter);
  app.use('/api/entities', entitiesRouter);
  app.use('/api', entitiesRouter); // Allow direct /api/locations, /api/technicians, etc.
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/google', googleSyncRouter);

  // Vite Middleware for Development / Static Hosting for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🚀 Sidrah CMMS Full-Stack Server Running!`);
    console.log(`📡 URL: http://0.0.0.0:${PORT}`);
    console.log(`🛠️ Backend API mounted at /api/*`);
    console.log(`🤖 Gemini AI integrated on server-side`);
    console.log(`=================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
