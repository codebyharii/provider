import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.leadAssignment.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.allocationState.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.service.deleteMany();

  console.log('Seeding Services...');
  const services = await Promise.all([
    prisma.service.create({ data: { name: 'Service 1' } }),
    prisma.service.create({ data: { name: 'Service 2' } }),
    prisma.service.create({ data: { name: 'Service 3' } }),
  ]);

  console.log('Seeding Providers...');
  const providers = [];
  for (let i = 1; i <= 8; i++) {
    const p = await prisma.provider.create({
      data: {
        name: `Provider ${i}`,
        monthlyQuota: 10,
        leadsReceived: 0,
        allocationIndex: 0,
      },
    });
    providers.push(p);
  }

  console.log('Seeding AllocationStates...');
  for (const s of services) {
    await prisma.allocationState.create({
      data: {
        serviceId: s.id,
        nextIndex: 0,
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
