import { Chip } from '../components/Chip';
import { designSummary, memberSchedule } from '../data/mock';
import './DesignBomScreen.css';

export function DesignBomScreen() {
  const s = designSummary;

  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>Member schedule</h2>
        <span className="hint">11 columns · 14 beams · 9 joists</span>
      </div>
      <p className="pane-sub">
        Sizes shown reflect actual computed spans for this revision, including the D2 grid shift.
      </p>
      <div className="summary-row">
        <div className="stat">
          <div className="label">Steel weight</div>
          <div className="value mono">{s.steelWeight}</div>
          <div className="sub">{s.steelWeightSub}</div>
        </div>
        <div className="stat">
          <div className="label">Deck area</div>
          <div className="value mono">{s.deckArea}</div>
          <div className="sub">{s.deckAreaSub}</div>
        </div>
        <div className="stat">
          <div className="label">Checks passed</div>
          <div className="value mono">{s.checksPassed}</div>
          <div className="sub">{s.checksSub}</div>
        </div>
        <div className="stat">
          <div className="label">Flags raised</div>
          <div className="value mono">{s.flagsRaised}</div>
          <div className="sub">{s.flagsSub}</div>
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
          {memberSchedule.map((row) => (
            <tr key={row.mark}>
              <td className="mono">{row.mark}</td>
              <td>{row.role}</td>
              <td className="mono">{row.section}</td>
              <td className="num mono">{row.span}</td>
              <td className="num mono">{row.utilisation}</td>
              <td>
                <Chip status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
