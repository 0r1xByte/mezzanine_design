import type { Vertex, ZoneType } from './api';

export interface ObstructionDraft {
  id: string;
  boundary: Vertex[];
  obstruction_type: string;
}

export interface ZoneDraft {
  id: string;
  boundary: Vertex[];
  zone_type: ZoneType;
  max_height_m?: number;
}

export interface TierDraft {
  boundary: Vertex[];
  obstructions: ObstructionDraft[];
  constraint_zones: ZoneDraft[];
  clear_height_m: number;
}

let counter = 0;
export function draftId(): string {
  counter += 1;
  return `draft-${Date.now()}-${counter}`;
}

export function emptyTier(clearHeightM = 4.5): TierDraft {
  return {
    boundary: [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 12 },
      { x: 0, y: 12 },
    ],
    obstructions: [],
    constraint_zones: [],
    clear_height_m: clearHeightM,
  };
}

export function snap(value: number, step = 0.25): number {
  return Math.round(value / step) * step;
}
