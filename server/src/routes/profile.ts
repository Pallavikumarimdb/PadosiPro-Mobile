import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';

export const profileRouter = Router();

const profileSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name to continue.'),
  address: z.string().min(5, 'Enter your address & area'),
  city: z.string().optional().default('Mumbai'),
  society: z.string().optional().nullable(),
  flatUnit: z.string().optional().nullable(),
  gateNotes: z.string().optional().nullable(),
  businessName: z.string().optional().nullable(),
});

profileRouter.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId: req.user!.sub } });
  return res.json({ ok: true, profile });
});

profileRouter.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.issues[0].message });
  const sub = req.user!.sub;
  const user = await prisma.user.findUnique({ where: { id: sub } });
  if (!user) return res.status(401).json({ ok: false, error: 'Account not found.' });
  const d = parsed.data;
  const profile = await prisma.userProfile.upsert({
    where: { userId: sub },
    create: {
      userId: sub, fullName: d.fullName.trim(), mobile: user.mobile,
      address: d.address.trim(), city: d.city ?? 'Mumbai',
      society: d.society || null, flatUnit: d.flatUnit || null,
      gateNotes: d.gateNotes || null, businessName: d.businessName || null,
    },
    update: {
      fullName: d.fullName.trim(), address: d.address.trim(), city: d.city ?? 'Mumbai',
      society: d.society || null, flatUnit: d.flatUnit || null,
      gateNotes: d.gateNotes || null, businessName: d.businessName || null,
    },
  });
  await prisma.user.update({ where: { id: sub }, data: { profileComplete: true } });
  return res.json({ ok: true, message: 'Profile saved', profile });
});
