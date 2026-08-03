export type WorkflowStepId =
  | 'enquiry'
  | 'geometry'
  | 'loads'
  | 'design'
  | 'pricing'
  | 'quote'
  | 'drawings';

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
}

export const workflowSteps: WorkflowStep[] = [
  { id: 'enquiry', label: 'Enquiry' },
  { id: 'geometry', label: 'Geometry' },
  { id: 'loads', label: 'Loads' },
  { id: 'design', label: 'Design & BOM' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'quote', label: 'Quote' },
  { id: 'drawings', label: 'Drawings' },
];

export interface ProjectSummary {
  name: string;
  client: string;
  revision: string;
  codeRegion: string;
  updated: string;
  status: 'draft' | 'reviewed';
}

export const project: ProjectSummary = {
  name: 'Riverside Distribution — Mezzanine B',
  client: 'Halden Logistics',
  revision: 'R4',
  codeRegion: 'EC3 · UK',
  updated: '02 Aug 2026',
  status: 'draft',
};

export interface MemberScheduleRow {
  mark: string;
  role: string;
  section: string;
  span: string;
  utilisation: string;
  status: 'pass' | 'review';
}

export const memberSchedule: MemberScheduleRow[] = [
  { mark: 'B04', role: 'Primary beam', section: '406×178×60 UB', span: '6.00 m', utilisation: '0.81', status: 'pass' },
  { mark: 'B12', role: 'Primary beam', section: '406×178×60 UB', span: '5.50 m', utilisation: '0.88', status: 'review' },
  { mark: 'J01–J24', role: 'Joist', section: '203×102×23 UB', span: '4.00 m', utilisation: '0.64', status: 'pass' },
  { mark: 'C01–C11', role: 'Column', section: '152×152×23 UC', span: '4.50 m', utilisation: '0.57', status: 'pass' },
  { mark: 'BR-02', role: 'Bracing bay', section: '90×90×8 EA', span: '—', utilisation: '0.42', status: 'pass' },
];

export interface DesignSummary {
  steelWeight: string;
  steelWeightSub: string;
  deckArea: string;
  deckAreaSub: string;
  checksPassed: string;
  checksSub: string;
  flagsRaised: string;
  flagsSub: string;
  recomputeTime: string;
}

export const designSummary: DesignSummary = {
  steelWeight: '18.4 t',
  steelWeightSub: '21.9 kg/m²',
  deckArea: '240 m²',
  deckAreaSub: '6 mm chequer plate',
  checksPassed: '34 / 34',
  checksSub: 'bending, shear, deflection',
  flagsRaised: '1',
  flagsSub: 'requires review',
  recomputeTime: '1.4 s',
};

export interface LineItem {
  description: string;
  qty: string;
  unit: string;
  rate: string;
  total: string;
}

export interface LineItemCategory {
  name: string;
  items: LineItem[];
}

export const quoteCategories: LineItemCategory[] = [
  {
    name: 'Structure',
    items: [
      { description: 'Primary & secondary beams, UB grade S355', qty: '9.6', unit: 't', rate: '£1,840', total: '£17,664' },
      { description: 'Columns, UC grade S355', qty: '3.1', unit: 't', rate: '£1,910', total: '£5,921' },
      { description: 'Bracing & connections', qty: '1.2', unit: 't', rate: '£2,150', total: '£2,580' },
    ],
  },
  {
    name: 'Decking & finishes',
    items: [
      { description: '6 mm chequer plate decking', qty: '240', unit: 'm²', rate: '£38', total: '£9,120' },
      { description: 'Handrail, galvanised', qty: '64', unit: 'm', rate: '£92', total: '£5,888' },
    ],
  },
  {
    name: 'Access',
    items: [
      { description: 'Straight staircase, 12 riser', qty: '1', unit: 'flight', rate: '£3,400', total: '£3,400' },
      { description: 'Pallet gate', qty: '2', unit: 'no.', rate: '£680', total: '£1,360' },
    ],
  },
];

export const quoteTotals = {
  subtotal: '£45,933',
  installation: '£8,200',
  contingency: '£2,707',
  total: '£56,840',
};

export const quoteAssumptions =
  'Assumes slab bearing capacity of 150 kN/m² (unconfirmed — site survey pending). ' +
  'Excludes fire protection and electrical works. Lead time 6–8 weeks from order.';

export interface GeometrySummary {
  footprint: string;
  clearHeight: string;
  vertices: string;
  obstructions: string;
  primarySpacing: string;
  secondarySpacing: string;
  columnsPlaced: string;
  flagNote: string;
}

export const geometrySummary: GeometrySummary = {
  footprint: '20.0 × 12.0 m',
  clearHeight: '4.50 m',
  vertices: '6',
  obstructions: '1',
  primarySpacing: '6.0 / 6.0 / 5.5 m',
  secondarySpacing: '4.0 m',
  columnsPlaced: '11',
  flagNote: 'Column at grid D2 shifted 0.6 m to clear existing obstruction — bay D1–D2 re-spanned.',
};
