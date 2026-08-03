import { useState, type FormEvent } from 'react';
import { createDesignRevision, createProject, type DesignRevision, type Project } from '../api';
import './EnquiryScreen.css';

interface EnquiryScreenProps {
  onCreated: (project: Project, revision: DesignRevision) => void;
}

export function EnquiryScreen({ onCreated }: EnquiryScreenProps) {
  const [name, setName] = useState('Riverside Distribution - Mezzanine B');
  const [client, setClient] = useState('Halden Logistics');
  const [usageType, setUsageType] = useState<Project['usageType']>('storage');
  const [widthM, setWidthM] = useState(20);
  const [depthM, setDepthM] = useState(12);
  const [clearHeightM, setClearHeightM] = useState(4.5);
  const [imposedKnM2, setImposedKnM2] = useState(5.0);
  const [superimposedKnM2, setSuperimposedKnM2] = useState(0.5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const project = await createProject({ name, client, usageType });
      const revision = await createDesignRevision(project.id, {
        widthM,
        depthM,
        clearHeightM,
        imposedKnM2,
        superimposedKnM2,
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

  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>New enquiry</h2>
      </div>
      <p className="pane-sub">
        A rectangular single-tier floor is generated from these inputs and sized immediately —
        refine geometry and loads later once you can see the numbers.
      </p>
      <form className="enquiry-form" onSubmit={handleSubmit}>
        <div className="field-card">
          <h3>Project</h3>
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

        <div className="field-card">
          <h3>Geometry</h3>
          <div className="field-grid">
            <label>
              Width (m)
              <input
                type="number"
                step="0.1"
                value={widthM}
                onChange={(e) => setWidthM(Number(e.target.value))}
                required
              />
            </label>
            <label>
              Depth (m)
              <input
                type="number"
                step="0.1"
                value={depthM}
                onChange={(e) => setDepthM(Number(e.target.value))}
                required
              />
            </label>
            <label>
              Clear height (m)
              <input
                type="number"
                step="0.1"
                value={clearHeightM}
                onChange={(e) => setClearHeightM(Number(e.target.value))}
                required
              />
            </label>
          </div>
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
