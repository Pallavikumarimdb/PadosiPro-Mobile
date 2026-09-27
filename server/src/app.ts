import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { authRouter } from './routes/auth.js';
import { profileRouter } from './routes/profile.js';
import { taskRouter } from './routes/tasks.js';

export function buildApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '256kb' }));

  app.get('/health', (_req, res) => res.json({ ok: true, service: 'padosipro-backend' }));

  app.use(authRouter);
  app.use(profileRouter);
  app.use(taskRouter);

  // Centralized error handling (must be last)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    const status = typeof err?.status === 'number' ? err.status : 500;
    res.status(status).json({
      ok: false,
      error: status === 500 ? 'Something went wrong. Please try again.' : err.message,
    });
  });

  return app;
}

export { config };
