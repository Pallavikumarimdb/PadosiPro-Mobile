import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

export const householdRouter = Router();

export const RELATIONS = ['Parent', 'Spouse', 'Child', 'Sibling', 'Pet', 'Other'] as const;

const memberSchema = z.object({
  name: z.string().min(2, 'Enter a name'),
  relation: z.enum(RELATIONS, { errorMap: () => ({ message: 'Pick a relation' }) }),
  notes: z.string().optional().nullable(),
});

householdRouter.get('/household', authMiddleware, async (req: AuthRequest, res) => {
  const members = await prisma.householdMember.findMany({
    where: { userId: req.user!.sub },
    orderBy: { createdAt: 'asc' },
  });
  return res.json({ ok: true, members });
});

householdRouter.post('/household', authMiddleware, async (req: AuthRequest, res) => {
  const parsed = memberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues[0].message });
  const member = await prisma.householdMember.create({
    data: {
      userId: req.user!.sub,
      name: parsed.data.name.trim(),
      relation: parsed.data.relation,
      notes: parsed.data.notes?.trim() || null,
    },
  });
  return res.status(201).json({ ok: true, member });
});

householdRouter.delete('/household/:id', authMiddleware, async (req: AuthRequest, res) => {
  const existing = await prisma.householdMember.findFirst({
    where: { id: req.params.id, userId: req.user!.sub },
  });
  if (!existing) return res.status(404).json({ ok: false, error: 'Member not found.' });
  await prisma.householdMember.delete({ where: { id: existing.id } });
  return res.json({ ok: true, message: 'Removed from household.' });
});
