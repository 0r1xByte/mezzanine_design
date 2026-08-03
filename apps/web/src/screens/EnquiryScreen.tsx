import { useState, type FormEvent } from 'react';
import { createDesignRevisionFromGeometry, createProject, type DesignRevision, type Project } from '../api';
import { PolygonCanvas } from '../components/PolygonCanvas';
import { emptyTier, type TierDraft } from '../geometryDraft';
import './EnquiryScreen.css';

interface EnquiryScreenProps {
  onCreated: (project: Project, revision: DesignRevision) => void;
}

export function EnquiryScreen({ onCreated }: EnquiryScreenProps) {
  const [name, setName] = useState('Riverside Distribution - Mezzanine B');
  const [client, setClient] = useState('Halden Logistics');
  const [usageType, setUsageType] = useState<Project['usageType']>('storage');
  const [tiers, setTiers] = useState<TierDraft[]>([emptyTier()]);
  const [activeTier, setActiveTier] = useState(0);
  const [spanWidthM, setSpanWidthM] = useState(30);
  const [spanDepthM, setSpanDepthM] = useState(20);
  const [imposedKnM2, setImposedKnM2] = useState(5.0);
  const [superimposedKnM2, setSuperimposedKnM2] = useState(0.5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateActiveTier(next: TierDraft) {
    setTiers((prev) => prev.map((t, i) => (i === activeTier ? next : t)));
  }

  function addTier() {
    setTiers((prev) => [...prev, emptyTier(prev[prev.length - 1]?.clear_height_m ?? 4.5)]);
    setActiveTier(tiers.length);
  }

  function removeTier(index: number) {
    if (tiers.length <= 1) return;
    setTiers((prev) => prev.filter((_, i) => i !== index));
    setActiveTier((prev) => Math.max(0, prev >= index ? prev - 1 : prev));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const project = await createProject({ name, client, usageType });
      const revision = await createDesignRevisionFromGeometry(project.id, {
        geometry: {
          tiers: tiers.map((t) => ({
            boundary: t.boundary,
            obstructions: t.obstructions.map((o) => ({ boundary: o.boundary, obstruction_type: o.obstruction_type })),
            constraint_zones: t.constraint_zones.map((z) => ({
              boundary: z.boundary,
              zone_type: z.zone_type,
              max_height_m: z.max_height_m,
            })),
            clear_height_m: t.clear_height_m,
          })),
        },
        loads: { imposed_kn_m2: imposedKnM2, superimposed_kn_m2: superimposedKnM2 },
      });
      onCreated(project, revision);
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Couldn't reach the API. If you're on the GitHub Pages preview, this needs apps/api " +
            'and services/calc-engine running locally — see the repo README.',
        );
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const tier = tiers[activeTier];

  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>New enquiry</h2>
      </div>
      <p className="pane-sub">
        Draw the boundary, mark any obstructions or constraint zones, and add tiers as needed — the
        design runs the moment you submit.
      </p>
      <form className="enquiry-form" onSubmit={handleSubmit}>
        <div className="field-card">
          <h3>Project</h3>
          <div className="field-grid-3">
            <label>
              Project name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Client
              <input value={client} onChange={(e) => setClient(e.target.value)} required />
            </label>
            <label>
              Usage type
              <select value={usageType} onChange={(e) => setUsageType(e.target.value as Project['usageType'])}>
                <option value="storage">Storage</option>
                <option value="office">Office</option>
                <option value="retail">Retail</option>
              </select>
            </label>
          </div>
        </div>

        <div className="field-card">
          <div className="tier-header">
            <h3>Geometry</h3>
            <div className="tier-tabs">
              {tiers.map((_, i) => (
                <button
                  type="button"
                  key={i}
                  className={`tier-tab ${i === activeTier ? 'active' : ''}`}
                  onClick={() => setActiveTier(i)}
                >
                  Tier {i + 1}
                  {tiers.length > 1 && (
                    <span
                      className="tier-tab-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTier(i);
                      }}
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}
              <button type="button" className="tier-tab tier-tab-add" onClick={addTier}>
                + Add tier
              </button>
            </div>
          </div>

          <div className="tier-settings">
            <label className="tier-inline-field">
              Clear height (m)
              <input
                type="number"
                step="0.1"
                value={tier.clear_height_m}
                onChange={(e) => updateActiveTier({ ...tier, clear_height_m: Number(e.target.value) })}
                required
              />
            </label>
            <label className="tier-inline-field">
              Canvas span W (m)
              <input type="number" step="1" value={spanWidthM} onChange={(e) => setSpanWidthM(Number(e.target.value))} />
            </label>
            <label className="tier-inline-field">
              Canvas span D (m)
              <input type="number" step="1" value={spanDepthM} onChange={(e) => setSpanDepthM(Number(e.target.value))} />
            </label>
          </div>

          <PolygonCanvas tier={tier} onChange={updateActiveTier} spanWidthM={spanWidthM} spanDepthM={spanDepthM} />
        </div>

        <div className="field-card">
          <h3>Loads</h3>
          <div className="field-grid">
            <label>
              Imposed load (kN/m²)
              <input
                type="number"
                step="0.1"
                value={imposedKnM2}
                onChange={(e) => setImposedKnM2(Number(e.target.value))}
                required
              />
            </label>
            <label>
              Superimposed load (kN/m²)
              <input
                type="number"
                step="0.1"
                value={superimposedKnM2}
                onChange={(e) => setSuperimposedKnM2(Number(e.target.value))}
                required
              />
            </label>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Designing...' : 'Create enquiry and run design'}
        </button>
      </form>
    </div>
  );
}
