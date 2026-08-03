import { geometrySummary } from '../data/mock';
import './GeometryScreen.css';

export function GeometryScreen() {
  const g = geometrySummary;

  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>Boundary & obstructions</h2>
        <span className="hint">Tier 1 of 1</span>
      </div>
      <p className="pane-sub">
        Draw the floor boundary, mark obstructions and access points. The grid updates live as
        constraints are added.
      </p>
      <div className="geo-layout">
        <div className="canvas">
          <span className="canvas-badge">Tier 1 — plan</span>
          <span className="canvas-scale mono">1 : 150</span>
          <svg viewBox="0 0 560 380" preserveAspectRatio="xMidYMid meet">
            <polygon
              points="60,50 460,50 460,230 320,230 320,330 60,330"
              fill="none"
              stroke="#2E6BB0"
              strokeWidth="2.5"
            />
            <g stroke="#B7C4D6" strokeWidth="1.2" opacity="0.85">
              <line x1="60" y1="130" x2="460" y2="130" />
              <line x1="60" y1="210" x2="460" y2="210" />
              <line x1="140" y1="50" x2="140" y2="330" />
              <line x1="220" y1="50" x2="220" y2="330" />
              <line x1="300" y1="50" x2="300" y2="330" />
              <line x1="380" y1="50" x2="380" y2="230" />
            </g>
            <g fill="#2E6BB0">
              <circle cx="140" cy="130" r="4.5" />
              <circle cx="220" cy="130" r="4.5" />
              <circle cx="300" cy="130" r="4.5" />
              <circle cx="380" cy="130" r="4.5" />
              <circle cx="140" cy="210" r="4.5" />
              <circle cx="220" cy="210" r="4.5" />
              <circle cx="300" cy="210" r="4.5" />
              <circle cx="380" cy="210" r="4.5" />
              <circle cx="140" cy="330" r="4.5" />
              <circle cx="220" cy="330" r="4.5" />
              <circle cx="300" cy="330" r="4.5" />
            </g>
            <g>
              <rect
                x="355"
                y="145"
                width="34"
                height="34"
                fill="#FBF0DD"
                stroke="#B5740E"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
              <text x="372" y="197" textAnchor="middle" fontSize="9" fill="#B5740E" fontFamily="Consolas, monospace">
                obstruction
              </text>
            </g>
            <g>
              <line x1="60" y1="290" x2="60" y2="330" stroke="#2F8558" strokeWidth="4" />
              <text x="34" y="315" fontSize="9" fill="#2F8558" fontFamily="Consolas, monospace">
                access
              </text>
            </g>
            <g fontFamily="Consolas, monospace" fontSize="10" fill="#5B6675">
              <text x="260" y="42">
                20.00 m
              </text>
              <text x="480" y="145" transform="rotate(90 480 145)">
                12.00 m
              </text>
            </g>
          </svg>
        </div>
        <div className="side-panel">
          <div className="field-card">
            <h3>Boundary</h3>
            <div className="field-row">
              <span className="k">Footprint</span>
              <span className="v mono">{g.footprint}</span>
            </div>
            <div className="field-row">
              <span className="k">Clear height</span>
              <span className="v mono">{g.clearHeight}</span>
            </div>
            <div className="field-row">
              <span className="k">Vertices</span>
              <span className="v mono">{g.vertices}</span>
            </div>
            <div className="field-row">
              <span className="k">Obstructions</span>
              <span className="v mono">{g.obstructions}</span>
            </div>
          </div>
          <div className="field-card">
            <h3>Grid proposal</h3>
            <div className="field-row">
              <span className="k">Primary spacing</span>
              <span className="v mono">{g.primarySpacing}</span>
            </div>
            <div className="field-row">
              <span className="k">Secondary spacing</span>
              <span className="v mono">{g.secondarySpacing}</span>
            </div>
            <div className="field-row">
              <span className="k">Columns placed</span>
              <span className="v mono">{g.columnsPlaced}</span>
            </div>
          </div>
          <div className="flag-note">
            <span className="flag-label">Flag</span> {g.flagNote}
          </div>
        </div>
      </div>
    </div>
  );
}
