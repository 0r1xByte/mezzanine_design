import type { DesignRevision } from '../api';
import { Chip } from '../components/Chip';
import './DesignBomScreen.css';

interface DesignBomScreenProps {
  revision: DesignRevision;
}

export function DesignBomScreen({ revision }: DesignBomScreenProps) {
  const { output } = revision;
  const columnCount = output.grids.reduce((sum, g) => sum + g.columns.length, 0);
  const beamCount = output.members.filter((m) => m.role === 'primary_beam').length;
  const joistCount = output.members.filter((m) => m.role === 'joist').length;

  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>Member schedule</h2>
        <span className="hint">
          {columnCount} columns · {beamCount} beam mark{beamCount === 1 ? '' : 's'} · {joistCount} joist mark
          {joistCount === 1 ? '' : 's'}
        </span>
      </div>
      <p className="pane-sub">Sizes reflect the actual computed spans for revision {revision.revisionNumber}.</p>
      <div className="summary-row">
        <div className="stat">
          <div className="label">Steel weight</div>
          <div className="value mono">{(output.steel_weight_kg / 1000).toFixed(1)} t</div>
          <div className="sub">{output.steel_weight_kg.toFixed(0)} kg</div>
        </div>
        <div className="stat">
          <div className="label">Deck area</div>
          <div className="value mono">{output.deck_area_m2.toFixed(0)} m²</div>
          <div className="sub">6 mm chequer plate</div>
        </div>
        <div className="stat">
          <div className="label">Checks passed</div>
          <div className="value mono">
            {output.checks_passed} / {output.checks_total}
          </div>
          <div className="sub">bending, shear, deflection, buckling</div>
        </div>
        <div className="stat">
          <div className="label">Flags raised</div>
          <div className="value mono">{output.warnings.length}</div>
          <div className="sub">{output.warnings.length > 0 ? 'requires review' : 'none'}</div>
        </div>
      </div>
      <table className="schedule">
        <thead>
          <tr>
            <th>Mark</th>
            <th>Role</th>
            <th>Section</th>
            <th className="num">Span</th>
            <th className="num">Utilisation</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {output.members.map((row) => (
            <tr key={row.mark}>
              <td className="mono">{row.mark}</td>
              <td>{row.role.replace('_', ' ')}</td>
              <td className="mono">{row.section}</td>
              <td className="num mono">{row.span_m !== null ? `${row.span_m.toFixed(2)} m` : '—'}</td>
              <td className="num mono">{row.utilisation.toFixed(2)}</td>
              <td>
                <Chip status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {output.assumptions.length > 0 && (
        <div className="assumptions-block">
          <h3>Assumptions</h3>
          <ul>
            {output.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
