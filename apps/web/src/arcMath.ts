import type { Vertex } from './api';

const ARC_SEGMENTS = 16;

/**
 * Tessellates a circular arc from p0 to p1 into straight segments — the calc engine's
 * geometry model only accepts straight-edge polygons, so an arc has to be approximated
 * client-side before it's sent to the API. Returns the intermediate + end points
 * (excludes p0, which the caller already has).
 */
export function tessellateArc(p0: Vertex, p1: Vertex, radius: number, bulgeFlip: boolean): Vertex[] {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const chord = Math.hypot(dx, dy);
  if (chord < 1e-6) return [p1];

  const effectiveRadius = Math.max(radius, chord / 2 + 1e-6);
  const mid = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
  const chordDir = { x: dx / chord, y: dy / chord };
  const perp = { x: -chordDir.y, y: chordDir.x };
  const h = Math.sqrt(Math.max(effectiveRadius ** 2 - (chord / 2) ** 2, 0));
  const sign = bulgeFlip ? -1 : 1;
  const center = { x: mid.x + perp.x * h * sign, y: mid.y + perp.y * h * sign };

  const startAngle = Math.atan2(p0.y - center.y, p0.x - center.x);
  const endAngle = Math.atan2(p1.y - center.y, p1.x - center.x);
  let delta = endAngle - startAngle;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;

  const points: Vertex[] = [];
  for (let i = 1; i <= ARC_SEGMENTS; i++) {
    const t = i / ARC_SEGMENTS;
    const angle = startAngle + delta * t;
    points.push({
      x: center.x + effectiveRadius * Math.cos(angle),
      y: center.y + effectiveRadius * Math.sin(angle),
    });
  }
  return points;
}

export function segmentLength(a: Vertex, b: Vertex): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Repositions `b` so it sits `length` metres from `a`, along the current a→b direction. */
export function setSegmentLength(a: Vertex, b: Vertex, length: number): Vertex {
  const current = segmentLength(a, b);
  if (current < 1e-6) return b;
  const t = length / current;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
