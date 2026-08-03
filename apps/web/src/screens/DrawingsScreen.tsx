import { FloorPlanSvg } from '../components/FloorPlanSvg';
import { drawingDxfUrl, materialTakeoffCsvUrl, type DesignRevision } from '../api';
import './DrawingsScreen.css';

interface DrawingsScreenProps {
  projectId: string;
  revision: DesignRevision;
}

export function DrawingsScreen({ projectId, revision }: DrawingsScreenProps) {
  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>Drawings</h2>
        <span className="hint">Revision {revision.revisionNumber}</span>
      </div>
      <p className="pane-sub">
        Generated from the same geometry and grid as the Geometry and Design &amp; BOM screens —
        the DXF is rendered by <span className="mono">services/calc-engine</span>, not redrawn here.
      </p>
      <div className="drawings-layout">
        <FloorPlanSvg revision={revision} />
        <div className="side-panel">
          <div className="field-card">
            <h3>Exports</h3>
            <a
              className="btn-primary"
              href={drawingDxfUrl(projectId, revision.revisionNumber)}
              target="_blank"
              rel="noreferrer"
            >
              Download sales drawing (DXF)
            </a>
            <a
              className="btn-secondary"
              href={materialTakeoffCsvUrl(projectId, revision.revisionNumber)}
              target="_blank"
              rel="noreferrer"
            >
              Download material take-off (CSV)
            </a>
          </div>
          <div className="field-card">
            <h3>Contents</h3>
            <div className="field-row">
              <span className="k">Boundary</span>
              <span className="v mono">layer BOUNDARY</span>
            </div>
            <div className="field-row">
              <span className="k">Obstructions</span>
              <span className="v mono">layer OBSTRUCTION</span>
            </div>
            <div className="field-row">
              <span className="k">Columns</span>
              <span className="v mono">layer COLUMNS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
