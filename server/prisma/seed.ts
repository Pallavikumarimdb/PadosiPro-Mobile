import { PrismaClient } from '@prisma/client';
import { TASKS, toTaskRow } from '../src/services/tasks.js';

const prisma = new PrismaClient();

async function main() {
  for (const t of TASKS) {
    const row = toTaskRow(t);
    await prisma.task.upsert({
      where: { title: row.title },
      update: { description: row.description, icon: row.icon, comingSoon: row.comingSoon, kinds: row.kinds, servicesByKind: row.servicesByKind },
      create: { ...row },
    });
  }
  console.log(`Seeded ${TASKS.length} tasks`);
}

main().finally(() => prisma.$disconnect());
