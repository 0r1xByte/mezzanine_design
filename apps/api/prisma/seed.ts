import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Rates in AUD.
const entries = [
  { category: 'Structure', description: 'Structural steelwork - joists, beams, columns, bracing (S355)', unit: 'kg', rate: 3.50 },
  { category: 'Decking', description: '6 mm chequer plate decking', unit: 'm2', rate: 72 },
  { category: 'Access', description: 'Handrail, galvanised', unit: 'm', rate: 175 },
  { category: 'Access', description: 'Straight staircase, 12 riser', unit: 'flight', rate: 6400 },
  { category: 'Access', description: 'Pallet gate', unit: 'no.', rate: 1280 },
];

async function main() {
  for (const entry of entries) {
    const existing = await prisma.priceBookEntry.findFirst({
      where: { description: entry.description, region: 'default' },
    });
    if (existing) {
      await prisma.priceBookEntry.update({ where: { id: existing.id }, data: entry });
    } else {
      await prisma.priceBookEntry.create({ data: { ...entry, region: 'default' } });
    }
  }
  console.log(`Seeded ${entries.length} price book entries.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
