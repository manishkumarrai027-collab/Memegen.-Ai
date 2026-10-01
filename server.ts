import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './api/routes.ts';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api', apiRouter);

// Basic health check for Cloud Run liveness/readiness probes
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// Serve static frontend build
const distDir = path.resolve(process.cwd(), 'dist');
app.use(express.static(distDir));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const serverPort = Number(process.env.PORT) || 3000;
app.listen(serverPort, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${serverPort}`);
});
