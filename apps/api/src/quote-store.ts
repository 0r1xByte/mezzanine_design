import { prisma } from './prisma.js';
import type { AncillarySelection, BomLine, LineItem, PriceBookEntryLike } from './quote-engine.js';
import { buildAncillaryLineItems, buildLineItemsFromBom, computeTotals } from './quote-engine.js';

export interface CreateQuoteInput {
  ancillarySelections?: AncillarySelection[];
  markupPercent?: number;
  contingencyPercent?: number;
  installationTotal?: number;
  assumptionsText?: string;
}

export async function createQuote(designRevisionId: string, input: CreateQuoteInput) {
  const revision = await prisma.designRevision.findUnique({ where: { id: designRevisionId } });
  if (!revision) return null;

  const output = revision.output as unknown as { bom: BomLine[]; assumptions: string[] };
  const priceBook = (await prisma.priceBookEntry.findMany({
    where: { region: 'default' },
  })) as unknown as PriceBookEntryLike[];

  const bomLineItems = buildLineItemsFromBom(output.bom, priceBook);
  const ancillaryLineItems = buildAncillaryLineItems(input.ancillarySelections ?? [], priceBook);
  const lineItems: LineItem[] = [...bomLineItems, ...ancillaryLineItems];

  return prisma.quote.upsert({
    where: { designRevisionId },
    create: {
      designRevisionId,
      lineItems: lineItems as unknown as object,
      markupPercent: input.markupPercent ?? 0,
      contingencyPercent: input.contingencyPercent ?? 5,
      installationTotal: input.installationTotal ?? 0,
      assumptionsText: input.assumptionsText ?? output.assumptions.join(' '),
    },
    update: {
      lineItems: lineItems as unknown as object,
      markupPercent: input.markupPercent ?? 0,
      contingencyPercent: input.contingencyPercent ?? 5,
      installationTotal: input.installationTotal ?? 0,
      assumptionsText: input.assumptionsText ?? output.assumptions.join(' '),
    },
  });
}

export async function getQuoteByRevision(designRevisionId: string) {
  return prisma.quote.findUnique({ where: { designRevisionId } });
}

export async function getQuoteById(id: string) {
  return prisma.quote.findUnique({ where: { id } });
}

export function withTotals<T extends { lineItems: unknown; markupPercent: unknown; contingencyPercent: unknown; installationTotal: unknown }>(
  quote: T,
) {
  const lineItems = quote.lineItems as unknown as LineItem[];
  const totals = computeTotals(
    lineItems,
    Number(quote.markupPercent),
    Number(quote.contingencyPercent),
    Number(quote.installationTotal),
  );
  return { ...quote, totals };
}
