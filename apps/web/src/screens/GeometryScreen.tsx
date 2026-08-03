import { useState } from 'react';
import { FloorPlanSvg } from '../components/FloorPlanSvg';
import { TierSelector } from '../components/TierSelector';
import type { DesignRevision } from '../api';
import './GeometryScreen.css';

interface GeometryScreenProps {
  revision: DesignRevision;
}

export function GeometryScreen({ revision }: GeometryScreenProps) {
  const [activeTier, setActiveTier] = useState(0);
  const tierCount = revision.input.geometry.tiers.length;
  const tier = revision.input.geometry.tiers[activeTier];
  const grid = revision.output.grids[activeTier];
  const boundary = tier.boundary;

  const widthM = Math.max(...boundary.map((v) => v.x)) - Math.min(...boundary.map((v) => v.x));
  const depthM = Math.max(...boundary.map((v) => v.y)) - Math.min(...boundary.map((v) => v.y));

  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>Boundary &amp; grid</h2>
        <span className="hint">
          Tier {activeTier + 1} of {tierCount}
        </span>
      </div>
      <p className="pane-sub">
        {widthM.toFixed(1)} × {depthM.toFixed(1)} m at {tier.clear_height_m.toFixed(1)} m clear
        height{tier.obstructions.length > 0 && `, ${tier.obstructions.length} obstruction(s)`}
        {tier.constraint_zones.length > 0 && `, ${tier.constraint_zones.length} constraint zone(s)`}.
      </p>
      <TierSelector count={tierCount} active={activeTier} onSelect={setActiveTier} />
      <div className="geo-layout">
        <FloorPlanSvg revision={revision} tierIndex={activeTier} />
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
            <div className="field-row">
              <span className="k">Obstructions</span>
              <span className="v mono">{tier.obstructions.length}</span>
            </div>
            <div className="field-row">
              <span className="k">Constraint zones</span>
              <span className="v mono">{tier.constraint_zones.length}</span>
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
