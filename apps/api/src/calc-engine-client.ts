const CALC_ENGINE_URL = process.env.CALC_ENGINE_URL ?? 'http://localhost:8000';

export interface DesignInput {
  geometry: unknown;
  loads?: unknown;
  structural_config?: unknown;
}

export class CalcEngineError extends Error {}

export async function runDesign(input: DesignInput): Promise<unknown> {
  const response = await fetch(`${CALC_ENGINE_URL}/design`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new CalcEngineError(`calc-engine /design failed (${response.status}): ${body}`);
  }

  return response.json();
}

export async function fetchDesignDxf(input: DesignInput): Promise<ArrayBuffer> {
  const response = await fetch(`${CALC_ENGINE_URL}/design/dxf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new CalcEngineError(`calc-engine /design/dxf failed (${response.status}): ${body}`);
  }

  return response.arrayBuffer();
}
