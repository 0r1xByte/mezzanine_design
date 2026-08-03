import { useEffect, useState, type FormEvent } from 'react';
import {
  createPriceBookEntry,
  deletePriceBookEntry,
  listPriceBook,
  updatePriceBookEntry,
  type PriceBookEntry,
} from '../api';
import './PricingScreen.css';

const EMPTY_FORM = { category: '', description: '', unit: '', rate: '' };

export function PricingScreen() {
  const [entries, setEntries] = useState<PriceBookEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState(EMPTY_FORM);
  const [newEntry, setNewEntry] = useState(EMPTY_FORM);
  const [savingNew, setSavingNew] = useState(false);

  async function refresh() {
    try {
      const rows = await listPriceBook();
      setEntries(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load price book.');
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function startEdit(entry: PriceBookEntry) {
    setEditingId(entry.id);
    setEditDraft({
      category: entry.category,
      description: entry.description,
      unit: entry.unit,
      rate: entry.rate,
    });
  }

  async function saveEdit(id: string) {
    try {
      await updatePriceBookEntry(id, {
        category: editDraft.category,
        description: editDraft.description,
        unit: editDraft.unit,
        rate: Number(editDraft.rate),
      });
      setEditingId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePriceBookEntry(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete.');
    }
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setSavingNew(true);
    setError(null);
    try {
      await createPriceBookEntry({
        category: newEntry.category,
        description: newEntry.description,
        unit: newEntry.unit,
        rate: Number(newEntry.rate),
      });
      setNewEntry(EMPTY_FORM);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry.');
    } finally {
      setSavingNew(false);
    }
  }

  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>Price book</h2>
        <span className="hint">{entries?.length ?? 0} entries · region: default</span>
      </div>
      <p className="pane-sub">
        Rates used to assemble quote line items from the BOM (matched by category and unit) and for
        ancillary selections. Changes apply to quotes generated after this point.
      </p>

      {error && <div className="form-error">{error}</div>}

      <table className="schedule pricing-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Description</th>
            <th>Unit</th>
            <th className="num">Rate (A$)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries?.map((entry) =>
            editingId === entry.id ? (
              <tr key={entry.id}>
                <td>
                  <input
                    value={editDraft.category}
                    onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={editDraft.description}
                    onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={editDraft.unit}
                    onChange={(e) => setEditDraft({ ...editDraft, unit: e.target.value })}
                  />
                </td>
                <td className="num">
                  <input
                    type="number"
                    step="0.01"
                    className="num-input"
                    value={editDraft.rate}
                    onChange={(e) => setEditDraft({ ...editDraft, rate: e.target.value })}
                  />
                </td>
                <td className="pricing-actions">
                  <button type="button" className="btn-link" onClick={() => saveEdit(entry.id)}>
                    Save
                  </button>
                  <button type="button" className="btn-link" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={entry.id}>
                <td>{entry.category}</td>
                <td>{entry.description}</td>
                <td>{entry.unit}</td>
                <td className="num mono">A${Number(entry.rate).toFixed(2)}</td>
                <td className="pricing-actions">
                  <button type="button" className="btn-link" onClick={() => startEdit(entry)}>
                    Edit
                  </button>
                  <button type="button" className="btn-link btn-link-danger" onClick={() => handleDelete(entry.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>

      <form className="pricing-add-form" onSubmit={handleAdd}>
        <input
          placeholder="Category"
          value={newEntry.category}
          onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
          required
        />
        <input
          placeholder="Description"
          value={newEntry.description}
          onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
          required
        />
        <input
          placeholder="Unit"
          value={newEntry.unit}
          onChange={(e) => setNewEntry({ ...newEntry, unit: e.target.value })}
          required
        />
        <input
          placeholder="Rate"
          type="number"
          step="0.01"
          value={newEntry.rate}
          onChange={(e) => setNewEntry({ ...newEntry, rate: e.target.value })}
          required
        />
        <button type="submit" className="btn-primary" disabled={savingNew}>
          {savingNew ? 'Adding…' : 'Add entry'}
        </button>
      </form>
    </div>
  );
}
