import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { TASKS, toTaskRow } from '../services/tasks.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

export const taskRouter = Router();

const requestSchema = z.object({
  category: z.string().min(1, 'Pick a category'),
  service: z.string().optional().nullable(),
  helpKind: z.string().optional().nullable(),
  urgency: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
});

taskRouter.get('/tasks', async (_req, res) => {
  const dbTasks = await prisma.task.findMany({ orderBy: { createdAt: 'asc' } }).catch(() => []);
  // Catalog lives in Postgres; fall back to the built-in copy only if the table is empty.
  const tasks = dbTasks.length ? dbTasks : TASKS.map(toTaskRow);
  return res.json({ ok: true, tasks });
});

taskRouter.get('/requests', authMiddleware, async (req: AuthRequest, res) => {
  const requests = await prisma.serviceRequest.findMany({
    where: { userId: req.user!.sub }, orderBy: { createdAt: 'desc' },
  });
  return res.json({ ok: true, requests });
});

taskRouter.post('/requests', authMiddleware, async (req: AuthRequest, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues[0].message });
  const created = await prisma.serviceRequest.create({ data: { userId: req.user!.sub, ...parsed.data } });
  return res.status(201).json({ ok: true, message: 'Request received. Your Lifestyle Manager will take it from here.', request: created });
});
