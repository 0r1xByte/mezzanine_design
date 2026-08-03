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

export interface Obstruction {
  boundary: Vertex[];
  obstruction_type: string;
}

export type ZoneType = 'no_go' | 'height_restricted' | 'mandatory_clear';

export interface ConstraintZone {
  boundary: Vertex[];
  zone_type: ZoneType;
  max_height_m?: number | null;
}

export interface TierGeometry {
  boundary: Vertex[];
  obstructions: Obstruction[];
  constraint_zones: ConstraintZone[];
  clear_height_m: number;
}

export interface GeometryInput {
  tiers: TierGeometry[];
}

export interface LoadCase {
  imposed_kn_m2: number;
  superimposed_kn_m2: number;
}

export interface DesignRevision {
  id: string;
  projectId: string;
  revisionNumber: number;
  status: string;
  createdAt: string;
  input: {
    geometry: GeometryInput;
    loads?: LoadCase;
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

export function createDesignRevisionFromGeometry(
  projectId: string,
  input: { geometry: GeometryInput; loads: LoadCase },
): Promise<DesignRevision> {
  return request(`/projects/${projectId}/design-revisions`, {
    method: 'POST',
    body: JSON.stringify(input),
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

export interface ImpactReport {
  fromRevision: number | null;
  toRevision: number;
  changedInputSections: string[];
  memberChanges: string[];
  metricChanges: string[];
  warningChanges: string[];
  unchanged: boolean;
  note?: string;
}

export function getRevisionImpact(projectId: string, revisionNumber: number): Promise<ImpactReport> {
  return request(`/projects/${projectId}/design-revisions/${revisionNumber}/impact`);
}

export interface PriceBookEntry {
  id: string;
  category: string;
  description: string;
  unit: string;
  rate: string;
  region: string;
  effectiveDate: string;
}

export interface PriceBookEntryInput {
  category: string;
  description: string;
  unit: string;
  rate: number;
}

export function listPriceBook(): Promise<PriceBookEntry[]> {
  return request('/price-book');
}

export function createPriceBookEntry(input: PriceBookEntryInput): Promise<PriceBookEntry> {
  return request('/price-book', { method: 'POST', body: JSON.stringify(input) });
}

export function updatePriceBookEntry(
  id: string,
  input: Partial<PriceBookEntryInput>,
): Promise<PriceBookEntry> {
  return request(`/price-book/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export function deletePriceBookEntry(id: string): Promise<void> {
  return request(`/price-book/${id}`, { method: 'DELETE' });
}
