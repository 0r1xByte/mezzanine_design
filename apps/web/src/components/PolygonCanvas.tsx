import { useRef, useState } from 'react';
import type { Vertex, ZoneType } from '../api';
import { segmentLength, setSegmentLength, tessellateArc } from '../arcMath';
import { draftId, snap, type TierDraft } from '../geometryDraft';
import './PolygonCanvas.css';

interface PolygonCanvasProps {
  tier: TierDraft;
  onChange: (tier: TierDraft) => void;
  spanWidthM: number;
  spanDepthM: number;
}

type Mode = 'idle' | 'boundary' | 'obstruction' | 'zone';
type DragTarget =
  | { shape: 'boundary'; index: number }
  | { shape: 'obstruction'; shapeIndex: number; index: number }
  | { shape: 'zone'; shapeIndex: number; index: number };

const ZONE_LABELS: Record<ZoneType, string> = {
  no_go: 'No-go zone',
  height_restricted: 'Height-restricted zone',
  mandatory_clear: 'Mandatory-clear zone (access)',
};

export function PolygonCanvas({ tier, onChange, spanWidthM, spanDepthM }: PolygonCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<Mode>('idle');
  const [draft, setDraft] = useState<Vertex[]>([]);
  const [pendingZoneType, setPendingZoneType] = useState<ZoneType>('no_go');
  const [pendingMaxHeight, setPendingMaxHeight] = useState(3.0);
  const [arcEnabled, setArcEnabled] = useState(false);
  const [arcRadius, setArcRadius] = useState(3.0);
  const [arcBulgeFlip, setArcBulgeFlip] = useState(false);
  const dragRef = useRef<DragTarget | null>(null);

  function clientToPlan(clientX: number, clientY: number): Vertex {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const local = pt.matrixTransform(ctm.inverse());
    return { x: snap(local.x), y: snap(spanDepthM - local.y) };
  }

  function toSvg(v: Vertex) {
    return { x: v.x, y: spanDepthM - v.y };
  }

  function startMode(next: Mode) {
    setMode(next);
    setDraft([]);
    setArcEnabled(false);
  }

  function handleCanvasClick(event: React.MouseEvent) {
    if (mode === 'idle') return;
    const point = clientToPlan(event.clientX, event.clientY);
    setDraft((prev) => {
      if (arcEnabled && prev.length > 0) {
        const arcPoints = tessellateArc(prev[prev.length - 1], point, arcRadius, arcBulgeFlip);
        return [...prev, ...arcPoints];
      }
      return [...prev, point];
    });
  }

  function flipLastArc() {
    setArcBulgeFlip((prev) => !prev);
  }

  const lastSegment =
    !arcEnabled && draft.length >= 2 ? { a: draft[draft.length - 2], b: draft[draft.length - 1] } : null;

  function handleLastSegmentLengthChange(value: number) {
    if (!lastSegment || !Number.isFinite(value) || value <= 0) return;
    const moved = setSegmentLength(lastSegment.a, lastSegment.b, value);
    setDraft((prev) => [...prev.slice(0, -1), moved]);
  }

  function finishShape() {
    if (draft.length < 3) return;
    if (mode === 'boundary') {
      onChange({ ...tier, boundary: draft });
    } else if (mode === 'obstruction') {
      onChange({
        ...tier,
        obstructions: [...tier.obstructions, { id: draftId(), boundary: draft, obstruction_type: 'existing_column' }],
      });
    } else if (mode === 'zone') {
      onChange({
        ...tier,
        constraint_zones: [
          ...tier.constraint_zones,
          {
            id: draftId(),
            boundary: draft,
            zone_type: pendingZoneType,
            max_height_m: pendingZoneType === 'height_restricted' ? pendingMaxHeight : undefined,
          },
        ],
      });
    }
    setMode('idle');
    setDraft([]);
  }

  function cancelShape() {
    setMode('idle');
    setDraft([]);
  }

  function removeObstruction(id: string) {
    onChange({ ...tier, obstructions: tier.obstructions.filter((o) => o.id !== id) });
  }

  function removeZone(id: string) {
    onChange({ ...tier, constraint_zones: tier.constraint_zones.filter((z) => z.id !== id) });
  }

  function startDrag(target: DragTarget) {
    return (event: React.PointerEvent) => {
      if (mode !== 'idle') return;
      event.stopPropagation();
      dragRef.current = target;

      function handleMove(moveEvent: PointerEvent) {
        const point = clientToPlan(moveEvent.clientX, moveEvent.clientY);
        const t = dragRef.current;
        if (!t) return;
        if (t.shape === 'boundary') {
          const boundary = tier.boundary.map((v, i) => (i === t.index ? point : v));
          onChange({ ...tier, boundary });
        } else if (t.shape === 'obstruction') {
          const obstructions = tier.obstructions.map((o, i) =>
            i === t.shapeIndex ? { ...o, boundary: o.boundary.map((v, j) => (j === t.index ? point : v)) } : o,
          );
          onChange({ ...tier, obstructions });
        } else {
          const constraint_zones = tier.constraint_zones.map((z, i) =>
            i === t.shapeIndex ? { ...z, boundary: z.boundary.map((v, j) => (j === t.index ? point : v)) } : z,
          );
          onChange({ ...tier, constraint_zones });
        }
      }

      function handleUp() {
        dragRef.current = null;
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      }

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    };
  }

  function removeVertex(target: DragTarget) {
    return (event: React.MouseEvent) => {
      event.stopPropagation();
      if (mode !== 'idle') return;
      if (target.shape === 'boundary') {
        if (tier.boundary.length <= 3) return;
        onChange({ ...tier, boundary: tier.boundary.filter((_, i) => i !== target.index) });
      } else if (target.shape === 'obstruction') {
        const shape = tier.obstructions[target.shapeIndex];
        if (shape.boundary.length <= 3) return;
        const obstructions = tier.obstructions.map((o, i) =>
          i === target.shapeIndex ? { ...o, boundary: o.boundary.filter((_, j) => j !== target.index) } : o,
        );
        onChange({ ...tier, obstructions });
      } else {
        const shape = tier.constraint_zones[target.shapeIndex];
        if (shape.boundary.length <= 3) return;
        const constraint_zones = tier.constraint_zones.map((z, i) =>
          i === target.shapeIndex ? { ...z, boundary: z.boundary.filter((_, j) => j !== target.index) } : z,
        );
        onChange({ ...tier, constraint_zones });
      }
    };
  }

  function polygonPoints(vertices: Vertex[]) {
    return vertices.map((v) => toSvg(v)).map((p) => `${p.x},${p.y}`).join(' ');
  }

  return (
    <div className="polygon-editor">
      <div className="polygon-toolbar">
        {mode === 'idle' ? (
          <>
            <button type="button" className="btn-secondary" onClick={() => startMode('boundary')}>
              Redraw boundary
            </button>
            <button type="button" className="btn-secondary" onClick={() => startMode('obstruction')}>
              Add obstruction
            </button>
            <button type="button" className="btn-secondary" onClick={() => startMode('zone')}>
              Add constraint zone
            </button>
          </>
        ) : (
          <>
            {mode === 'zone' && (
              <>
                <select value={pendingZoneType} onChange={(e) => setPendingZoneType(e.target.value as ZoneType)}>
                  <option value="no_go">No-go zone</option>
                  <option value="height_restricted">Height-restricted zone</option>
                  <option value="mandatory_clear">Mandatory-clear zone (access)</option>
                </select>
                {pendingZoneType === 'height_restricted' && (
                  <label className="polygon-inline-field">
                    Max height (m)
                    <input
                      type="number"
                      step="0.1"
                      value={pendingMaxHeight}
                      onChange={(e) => setPendingMaxHeight(Number(e.target.value))}
                    />
                  </label>
                )}
              </>
            )}
            <span className="polygon-hint">
              Click to place points ({draft.length} placed, {Math.max(0, 3 - draft.length)} more needed)
            </span>
            <button type="button" className="btn-primary polygon-btn-sm" onClick={finishShape} disabled={draft.length < 3}>
              Finish shape
            </button>
            <button type="button" className="btn-secondary polygon-btn-sm" onClick={cancelShape}>
              Cancel
            </button>
          </>
        )}
      </div>

      {mode !== 'idle' && (
        <div className="polygon-toolbar">
          <label className="polygon-inline-field">
            <input
              type="checkbox"
              checked={arcEnabled}
              onChange={(e) => setArcEnabled(e.target.checked)}
              disabled={draft.length === 0}
            />
            Arc to next point
          </label>
          {arcEnabled && (
            <>
              <label className="polygon-inline-field">
                Radius (m)
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={arcRadius}
                  onChange={(e) => setArcRadius(Number(e.target.value))}
                />
              </label>
              <button type="button" className="btn-secondary polygon-btn-sm" onClick={flipLastArc}>
                Flip arc side
              </button>
            </>
          )}
          {lastSegment && (
            <label className="polygon-inline-field">
              Last segment length (m)
              <input
                type="number"
                step="0.05"
                value={snap(segmentLength(lastSegment.a, lastSegment.b), 0.01)}
                onChange={(e) => handleLastSegmentLengthChange(Number(e.target.value))}
              />
            </label>
          )}
        </div>
      )}

      <svg
        ref={svgRef}
        className="polygon-svg"
        viewBox={`0 0 ${spanWidthM} ${spanDepthM}`}
        onClick={handleCanvasClick}
      >
        {Array.from({ length: Math.floor(spanWidthM) + 1 }, (_, i) => (
          <line key={`gx${i}`} x1={i} y1={0} x2={i} y2={spanDepthM} className="polygon-gridline" />
        ))}
        {Array.from({ length: Math.floor(spanDepthM) + 1 }, (_, i) => (
          <line key={`gy${i}`} x1={0} y1={i} x2={spanWidthM} y2={i} className="polygon-gridline" />
        ))}

        {tier.boundary.length > 0 && (
          <polygon points={polygonPoints(tier.boundary)} className="polygon-boundary" />
        )}
        {tier.boundary.map((v, i) => {
          const p = toSvg(v);
          return (
            <circle
              key={`b${i}`}
              cx={p.x}
              cy={p.y}
              r={0.22}
              className="polygon-vertex polygon-vertex-boundary"
              onPointerDown={startDrag({ shape: 'boundary', index: i })}
              onDoubleClick={removeVertex({ shape: 'boundary', index: i })}
            />
          );
        })}

        {tier.obstructions.map((o, si) => (
          <g key={o.id}>
            <polygon points={polygonPoints(o.boundary)} className="polygon-obstruction" />
            {o.boundary.map((v, i) => {
              const p = toSvg(v);
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={0.18}
                  className="polygon-vertex polygon-vertex-obstruction"
                  onPointerDown={startDrag({ shape: 'obstruction', shapeIndex: si, index: i })}
                  onDoubleClick={removeVertex({ shape: 'obstruction', shapeIndex: si, index: i })}
                />
              );
            })}
          </g>
        ))}

        {tier.constraint_zones.map((z, si) => (
          <g key={z.id}>
            <polygon
              points={polygonPoints(z.boundary)}
              className={`polygon-zone polygon-zone-${z.zone_type}`}
            />
            {z.boundary.map((v, i) => {
              const p = toSvg(v);
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={0.18}
                  className="polygon-vertex polygon-vertex-zone"
                  onPointerDown={startDrag({ shape: 'zone', shapeIndex: si, index: i })}
                  onDoubleClick={removeVertex({ shape: 'zone', shapeIndex: si, index: i })}
                />
              );
            })}
          </g>
        ))}

        {mode !== 'idle' && draft.length > 0 && (
          <>
            <polyline points={polygonPoints(draft)} className="polygon-draft" />
            {draft.map((v, i) => {
              const p = toSvg(v);
              return <circle key={i} cx={p.x} cy={p.y} r={0.2} className="polygon-vertex polygon-vertex-draft" />;
            })}
          </>
        )}
      </svg>

      {(tier.obstructions.length > 0 || tier.constraint_zones.length > 0) && (
        <div className="polygon-shape-list">
          {tier.obstructions.map((o) => (
            <div className="polygon-shape-chip" key={o.id}>
              <span>Obstruction ({o.boundary.length} pts)</span>
              <button type="button" onClick={() => removeObstruction(o.id)}>
                Remove
              </button>
            </div>
          ))}
          {tier.constraint_zones.map((z) => (
            <div className="polygon-shape-chip" key={z.id}>
              <span>
                {ZONE_LABELS[z.zone_type]}
                {z.zone_type === 'height_restricted' && z.max_height_m ? ` (max ${z.max_height_m} m)` : ''}
              </span>
              <button type="button" onClick={() => removeZone(z.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="polygon-tip">
        Drag a vertex to move it. Double-click a vertex to delete it (min. 3 per shape). While
        drawing: tick "Arc to next point" and set a radius to curve the last edge — it's tessellated
        into a series of straight segments before it's sent to the design engine, which only accepts
        straight-edge polygons. Edit "Last segment length" to place the most recent point at an exact
        distance instead of eyeballing it.
      </p>
    </div>
  );
}
