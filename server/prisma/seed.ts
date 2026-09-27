import { PrismaClient } from '@prisma/client';
import { TASKS } from '../src/services/tasks.js';

const prisma = new PrismaClient();

async function main() {
  for (const t of TASKS) {
    await prisma.task.upsert({
      where: { title: t.title },
      update: { description: t.description, icon: t.icon, comingSoon: t.comingSoon, kinds: t.kinds, services: t.services },
      create: { title: t.title, description: t.description, icon: t.icon, comingSoon: t.comingSoon, kinds: t.kinds, services: t.services },
    });
  }
  console.log(`Seeded ${TASKS.length} tasks`);
}

main().finally(() => prisma.$disconnect());
