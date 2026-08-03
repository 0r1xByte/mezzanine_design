const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface Project {
  id: string;
  name: string;
  client: string;
  usageType: 'storage' | 'office' | 'retail';
  status: string;
  createdAt: string;
}

export interface MemberScheduleRow {
  mark: string;
  role: string;
  tier_index: number;
  section: string;
  span_m: number | null;
  utilisation: number;
  status: 'pass' | 'review';
}

export interface BomLine {
  category: string;
  description: string;
  unit: string;
  quantity: number;
  wastage_factor: number;
}

export interface GridInfo {
  tier_index: number;
  primary_spacings_m: number[];
  secondary_spacing_m: number;
  columns: { x: number; y: number }[];
  skipped_columns: { x: number; y: number }[];
}

export interface DesignOutput {
  grids: GridInfo[];
  members: MemberScheduleRow[];
  bom: BomLine[];
  steel_weight_kg: number;
  deck_area_m2: number;
  checks_passed: number;
  checks_total: number;
  assumptions: string[];
  warnings: string[];
}

export interface Vertex {
  x: number;
  y: number;
}

export interface DesignRevision {
  id: string;
  projectId: string;
  revisionNumber: number;
  status: string;
  createdAt: string;
  input: {
    geometry: { tiers: { boundary: Vertex[]; clear_height_m: number }[] };
    loads?: { imposed_kn_m2: number; superimposed_kn_m2: number };
  };
  output: DesignOutput;
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

export interface QuoteTotals {
  subtotal: number;
  installation: number;
  contingency: number;
  total: number;
}

export interface Quote {
  id: string;
  designRevisionId: string;
  lineItems: LineItem[];
  markupPercent: string;
  contingencyPercent: string;
  installationTotal: string;
  assumptionsText: string;
  totals: QuoteTotals;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${init?.method ?? 'GET'} ${path} failed (${response.status}): ${body}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function createProject(input: {
  name: string;
  client: string;
  usageType: Project['usageType'];
}): Promise<Project> {
  return request('/projects', { method: 'POST', body: JSON.stringify(input) });
}

export interface CreateDesignRevisionInput {
  widthM: number;
  depthM: number;
  clearHeightM: number;
  imposedKnM2: number;
  superimposedKnM2: number;
}

export function createDesignRevision(
  projectId: string,
  input: CreateDesignRevisionInput,
): Promise<DesignRevision> {
  const body = {
    geometry: {
      tiers: [
        {
          boundary: [
            { x: 0, y: 0 },
            { x: input.widthM, y: 0 },
            { x: input.widthM, y: input.depthM },
            { x: 0, y: input.depthM },
          ],
          clear_height_m: input.clearHeightM,
        },
      ],
    },
    loads: {
      imposed_kn_m2: input.imposedKnM2,
      superimposed_kn_m2: input.superimposedKnM2,
    },
  };
  return request(`/projects/${projectId}/design-revisions`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function generateQuote(
  projectId: string,
  revisionNumber: number,
  input: { markupPercent: number; contingencyPercent: number; installationTotal: number },
): Promise<Quote> {
  return request(`/projects/${projectId}/design-revisions/${revisionNumber}/quote`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getQuote(projectId: string, revisionNumber: number): Promise<Quote> {
  return request(`/projects/${projectId}/design-revisions/${revisionNumber}/quote`);
}

export function quotePdfUrl(projectId: string, revisionNumber: number): string {
  return `${API_URL}/projects/${projectId}/design-revisions/${revisionNumber}/quote/pdf`;
}

export function drawingDxfUrl(projectId: string, revisionNumber: number): string {
  return `${API_URL}/projects/${projectId}/design-revisions/${revisionNumber}/drawing.dxf`;
}

export function materialTakeoffCsvUrl(projectId: string, revisionNumber: number): string {
  return `${API_URL}/projects/${projectId}/design-revisions/${revisionNumber}/material-takeoff.csv`;
}
