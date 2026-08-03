import type { DesignRevision } from '../api';
import './FloorPlanSvg.css';

interface FloorPlanSvgProps {
  revision: DesignRevision;
  tierIndex?: number;
}

const VIEW_SIZE = 560;
const MARGIN = 50;

const ZONE_COLORS: Record<string, string> = {
  no_go: '#C4362B',
  height_restricted: '#B5740E',
  mandatory_clear: '#2F8558',
};

export function FloorPlanSvg({ revision, tierIndex = 0 }: FloorPlanSvgProps) {
  const tier = revision.input.geometry.tiers[tierIndex];
  const grid = revision.output.grids[tierIndex];
  const boundary = tier.boundary;

  const minX = Math.min(...boundary.map((v) => v.x));
  const maxX = Math.max(...boundary.map((v) => v.x));
  const minY = Math.min(...boundary.map((v) => v.y));
  const maxY = Math.max(...boundary.map((v) => v.y));
  const widthM = maxX - minX;
  const depthM = maxY - minY;
  const scale = Math.min((VIEW_SIZE - 2 * MARGIN) / widthM, (VIEW_SIZE - 2 * MARGIN) / depthM);

  const toSvg = (x: number, y: number) => ({
    x: MARGIN + (x - minX) * scale,
    y: VIEW_SIZE - MARGIN - (y - minY) * scale,
  });

  const toPoints = (vertices: { x: number; y: number }[]) =>
    vertices.map((v) => toSvg(v.x, v.y)).map((p) => `${p.x},${p.y}`).join(' ');

  const boundaryPoints = boundary.map((v) => toSvg(v.x, v.y));

  return (
    <div className="canvas">
      <span className="canvas-badge">Tier {tierIndex + 1} — plan</span>
      <span className="canvas-scale mono">revision {revision.revisionNumber}</span>
      <svg viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`} preserveAspectRatio="xMidYMid meet">
        <polygon points={toPoints(boundary)} fill="none" stroke="#2E6BB0" strokeWidth="2.5" />

        {tier.obstructions.map((o, i) => (
          <polygon
            key={`o${i}`}
            points={toPoints(o.boundary)}
            fill="#FBF0DD"
            stroke="#B5740E"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
        ))}

        {tier.constraint_zones.map((z, i) => (
          <polygon
            key={`z${i}`}
            points={toPoints(z.boundary)}
            fill={`${ZONE_COLORS[z.zone_type]}1A`}
            stroke={ZONE_COLORS[z.zone_type]}
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        ))}

        <g fill="#2E6BB0">
          {grid.columns.map((col, i) => {
            const p = toSvg(col.x, col.y);
            return <circle key={i} cx={p.x} cy={p.y} r="4.5" />;
          })}
        </g>
        <g fill="#B5740E">
          {grid.skipped_columns.map((col, i) => {
            const p = toSvg(col.x, col.y);
            return <circle key={i} cx={p.x} cy={p.y} r="4.5" fillOpacity="0.4" />;
          })}
        </g>
        <g fontFamily="Consolas, monospace" fontSize="10" fill="#5B6675">
          <text x={boundaryPoints[0].x + (boundaryPoints[1].x - boundaryPoints[0].x) / 2 - 20} y={boundaryPoints[0].y - 8}>
            {widthM.toFixed(1)} m
          </text>
        </g>
      </svg>
    </div>
  );
}
