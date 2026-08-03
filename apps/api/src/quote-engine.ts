export interface BomLine {
  category: string;
  description: string;
  unit: string;
  quantity: number;
  wastage_factor: number;
}

export interface PriceBookEntryLike {
  id: string;
  category: string;
  description: string;
  unit: string;
  rate: number;
}

export interface LineItem {
  category: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number | null;
  total: number | null;
  priceBookEntryId: string | null;
  unpriced?: boolean;
}

export interface AncillarySelection {
  priceBookEntryId: string;
  quantity: number;
}

export function buildLineItemsFromBom(bomLines: BomLine[], priceBook: PriceBookEntryLike[]): LineItem[] {
  return bomLines.map((line) => {
    const match = priceBook.find(
      (entry) => entry.category.toLowerCase() === line.category.toLowerCase() && entry.unit === line.unit,
    );
    const quantity = round2(line.quantity * line.wastage_factor);
    if (!match) {
      return {
        category: line.category,
        description: line.description,
        unit: line.unit,
        quantity,
        rate: null,
        total: null,
        priceBookEntryId: null,
        unpriced: true,
      };
    }
    return {
      category: match.category,
      description: match.description,
      unit: match.unit,
      quantity,
      rate: match.rate,
      total: round2(quantity * match.rate),
      priceBookEntryId: match.id,
    };
  });
}

export function buildAncillaryLineItems(
  selections: AncillarySelection[],
  priceBook: PriceBookEntryLike[],
): LineItem[] {
  return selections
    .map((selection): LineItem | null => {
      const entry = priceBook.find((e) => e.id === selection.priceBookEntryId);
      if (!entry) return null;
      return {
        category: entry.category,
        description: entry.description,
        unit: entry.unit,
        quantity: selection.quantity,
        rate: entry.rate,
        total: round2(selection.quantity * entry.rate),
        priceBookEntryId: entry.id,
      };
    })
    .filter((item): item is LineItem => item !== null);
}

export interface QuoteTotals {
  subtotal: number;
  installation: number;
  contingency: number;
  total: number;
}

export function computeTotals(
  lineItems: LineItem[],
  markupPercent: number,
  contingencyPercent: number,
  installationTotal: number,
): QuoteTotals {
  const materialsSubtotal = lineItems.reduce((sum, item) => sum + (item.total ?? 0), 0);
  const withMarkup = materialsSubtotal * (1 + markupPercent / 100);
  const contingency = withMarkup * (contingencyPercent / 100);
  const total = withMarkup + contingency + installationTotal;

  return {
    subtotal: round2(withMarkup),
    installation: round2(installationTotal),
    contingency: round2(contingency),
    total: round2(total),
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
