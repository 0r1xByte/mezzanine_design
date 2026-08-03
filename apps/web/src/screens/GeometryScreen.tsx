import type { DesignRevision } from '../api';
import './GeometryScreen.css';

interface GeometryScreenProps {
  revision: DesignRevision;
}

const VIEW_SIZE = 560;
const MARGIN = 50;

export function GeometryScreen({ revision }: GeometryScreenProps) {
  const tier = revision.input.geometry.tiers[0];
  const grid = revision.output.grids[0];
  const boundary = tier.boundary;

  const widthM = Math.max(...boundary.map((v) => v.x));
  const depthM = Math.max(...boundary.map((v) => v.y));
  const scale = Math.min((VIEW_SIZE - 2 * MARGIN) / widthM, (VIEW_SIZE - 2 * MARGIN) / depthM);

  const toSvg = (x: number, y: number) => ({
    x: MARGIN + x * scale,
    y: VIEW_SIZE - MARGIN - y * scale,
  });

  const boundaryPoints = boundary.map((v) => toSvg(v.x, v.y));
  const polygonPoints = boundaryPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>Boundary &amp; grid</h2>
        <span className="hint">Tier 1 of {revision.input.geometry.tiers.length}</span>
      </div>
      <p className="pane-sub">
        Generated from the enquiry inputs — {widthM.toFixed(1)} × {depthM.toFixed(1)} m at{' '}
        {tier.clear_height_m.toFixed(1)} m clear height.
      </p>
      <div className="geo-layout">
        <div className="canvas">
          <span className="canvas-badge">Tier 1 — plan</span>
          <span className="canvas-scale mono">revision {revision.revisionNumber}</span>
          <svg viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`} preserveAspectRatio="xMidYMid meet">
            <polygon points={polygonPoints} fill="none" stroke="#2E6BB0" strokeWidth="2.5" />
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
        <div className="side-panel">
          <div className="field-card">
            <h3>Boundary</h3>
            <div className="field-row">
              <span className="k">Footprint</span>
              <span className="v mono">
                {widthM.toFixed(1)} × {depthM.toFixed(1)} m
              </span>
            </div>
            <div className="field-row">
              <span className="k">Clear height</span>
              <span className="v mono">{tier.clear_height_m.toFixed(2)} m</span>
            </div>
            <div className="field-row">
              <span className="k">Vertices</span>
              <span className="v mono">{boundary.length}</span>
            </div>
          </div>
          <div className="field-card">
            <h3>Grid</h3>
            <div className="field-row">
              <span className="k">Primary spacing</span>
              <span className="v mono">{grid.primary_spacings_m.map((s) => s.toFixed(1)).join(' / ')} m</span>
            </div>
            <div className="field-row">
              <span className="k">Secondary spacing</span>
              <span className="v mono">{grid.secondary_spacing_m.toFixed(1)} m</span>
            </div>
            <div className="field-row">
              <span className="k">Columns placed</span>
              <span className="v mono">{grid.columns.length}</span>
            </div>
          </div>
          {revision.output.warnings.map((warning, i) => (
            <div className="flag-note" key={i}>
              <span className="flag-label">Flag</span> {warning}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
