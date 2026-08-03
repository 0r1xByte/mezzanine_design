import { prisma } from './prisma.js';

export interface PriceBookEntryInput {
  category: string;
  description: string;
  unit: string;
  rate: number;
  region?: string;
}

export async function listPriceBook(region = 'default') {
  return prisma.priceBookEntry.findMany({ where: { region }, orderBy: [{ category: 'asc' }, { description: 'asc' }] });
}

export async function getPriceBookEntry(id: string) {
  return prisma.priceBookEntry.findUnique({ where: { id } });
}

export async function createPriceBookEntry(input: PriceBookEntryInput) {
  return prisma.priceBookEntry.create({
    data: { ...input, region: input.region ?? 'default' },
  });
}

export async function updatePriceBookEntry(id: string, input: Partial<PriceBookEntryInput>) {
  return prisma.priceBookEntry.update({ where: { id }, data: input });
}

export async function deletePriceBookEntry(id: string) {
  return prisma.priceBookEntry.delete({ where: { id } });
}
