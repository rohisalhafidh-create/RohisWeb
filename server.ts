import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiApp, { seedDatabase } from './api/index.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Seeding khusus untuk local development jika database kosong
  try {
    await seedDatabase();
  } catch (err) {
    console.error("Error seeding database:", err);
  }

  // Gunakan routes dari Serverless API
  app.use(apiApp);

  // Vite middleware untuk local development frontend
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
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
