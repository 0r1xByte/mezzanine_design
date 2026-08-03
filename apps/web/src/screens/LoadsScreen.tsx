import { useState, type FormEvent } from 'react';
import { createDesignRevisionFromGeometry, getRevisionImpact, type DesignRevision, type ImpactReport } from '../api';
import './LoadsScreen.css';

interface LoadsScreenProps {
  projectId: string;
  revision: DesignRevision;
  onRevised: (revision: DesignRevision) => void;
}

export function LoadsScreen({ projectId, revision, onRevised }: LoadsScreenProps) {
  const [imposedKnM2, setImposedKnM2] = useState(revision.input.loads?.imposed_kn_m2 ?? 5.0);
  const [superimposedKnM2, setSuperimposedKnM2] = useState(
    revision.input.loads?.superimposed_kn_m2 ?? 0.5,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [impact, setImpact] = useState<ImpactReport | null>(null);

  const isUnchanged =
    imposedKnM2 === (revision.input.loads?.imposed_kn_m2 ?? 5.0) &&
    superimposedKnM2 === (revision.input.loads?.superimposed_kn_m2 ?? 0.5);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setImpact(null);
    try {
      const newRevision = await createDesignRevisionFromGeometry(projectId, {
        geometry: revision.input.geometry,
        loads: { imposed_kn_m2: imposedKnM2, superimposed_kn_m2: superimposedKnM2 },
      });
      const report = await getRevisionImpact(projectId, newRevision.revisionNumber);
      setImpact(report);
      onRevised(newRevision);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>Loads</h2>
        <span className="hint">Revision {revision.revisionNumber}</span>
      </div>
      <p className="pane-sub">
        Changing a load creates a new design revision — geometry stays the same, every member gets
        re-checked, and the change is reported below rather than silently applied.
      </p>
      <div className="loads-layout">
        <form className="field-card" onSubmit={handleSubmit}>
          <h3>Load case</h3>
          <label className="loads-field">
            Imposed load (kN/m²)
            <input
              type="number"
              step="0.1"
              value={imposedKnM2}
              onChange={(e) => setImposedKnM2(Number(e.target.value))}
              required
            />
          </label>
          <label className="loads-field">
            Superimposed load (kN/m²)
            <input
              type="number"
              step="0.1"
              value={superimposedKnM2}
              onChange={(e) => setSuperimposedKnM2(Number(e.target.value))}
              required
            />
          </label>
          <button type="submit" className="btn-primary" disabled={submitting || isUnchanged}>
            {submitting ? 'Recalculating…' : 'Recalculate design'}
          </button>
          {isUnchanged && !submitting && <p className="loads-hint">Change a value to recalculate.</p>}
        </form>

        <div className="side-panel">
          {error && <div className="form-error">{error}</div>}

          {impact && (
            <div className="field-card">
              <h3>
                Change impact — R{impact.fromRevision ?? '?'} → R{impact.toRevision}
              </h3>
              {impact.unchanged ? (
                <p className="loads-hint">No change in the design output.</p>
              ) : (
                <>
                  {impact.memberChanges.map((m, i) => (
                    <div className="impact-row" key={`m-${i}`}>
                      {m}
                    </div>
                  ))}
                  {impact.metricChanges.map((m, i) => (
                    <div className="impact-row" key={`k-${i}`}>
                      {m}
                    </div>
                  ))}
                  {impact.warningChanges.map((m, i) => (
                    <div className="impact-row impact-warning" key={`w-${i}`}>
                      {m}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {!impact && !error && (
            <div className="field-card">
              <h3>Current load case</h3>
              <div className="field-row">
                <span className="k">Imposed</span>
                <span className="v mono">{(revision.input.loads?.imposed_kn_m2 ?? 5).toFixed(1)} kN/m²</span>
              </div>
              <div className="field-row">
                <span className="k">Superimposed</span>
                <span className="v mono">
                  {(revision.input.loads?.superimposed_kn_m2 ?? 0.5).toFixed(1)} kN/m²
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
