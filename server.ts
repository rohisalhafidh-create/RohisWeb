import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiApp, { seedDatabase } from './api/index.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Seeding khusus untuk local development jika database kosong
  try {
    await seedDatabase();
  } catch (err) {
    console.error("Error seeding database:", err);
  }

  // Gunakan routes API hanya untuk request /api agar Vite dapat melayani SPA.
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return apiApp(req, res);
    next();
  });

  // Vite middleware untuk local development frontend
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.use(async (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      try {
        const template = await vite.transformIndexHtml(req.originalUrl, await import('fs/promises').then(fs => fs.readFile(path.resolve('index.html'), 'utf-8')));
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (error) {
        next(error);
      }
    });
  } else {
    // Mode build lokal
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
