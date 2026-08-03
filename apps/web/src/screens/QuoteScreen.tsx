import { Fragment, useEffect, useState } from 'react';
import { drawingDxfUrl, generateQuote, getQuote, materialTakeoffCsvUrl, quotePdfUrl, type DesignRevision, type Quote } from '../api';
import './QuoteScreen.css';

interface QuoteScreenProps {
  projectId: string;
  revision: DesignRevision;
}

const DEFAULT_MARKUP_PERCENT = 10;
const DEFAULT_CONTINGENCY_PERCENT = 5;
const DEFAULT_INSTALLATION_TOTAL = 15500; // AUD

export function QuoteScreen({ projectId, revision }: QuoteScreenProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        let result: Quote;
        try {
          result = await getQuote(projectId, revision.revisionNumber);
        } catch {
          result = await generateQuote(projectId, revision.revisionNumber, {
            markupPercent: DEFAULT_MARKUP_PERCENT,
            contingencyPercent: DEFAULT_CONTINGENCY_PERCENT,
            installationTotal: DEFAULT_INSTALLATION_TOTAL,
          });
        }
        if (!cancelled) setQuote(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load quote.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId, revision.revisionNumber]);

  if (loading) {
    return (
      <div className="main-pane">
        <div className="pane-head">
          <h2>Line items</h2>
        </div>
        <p className="pane-sub">Generating quote…</p>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="main-pane">
        <div className="pane-head">
          <h2>Line items</h2>
        </div>
        <div className="form-error">{error ?? 'No quote available.'}</div>
      </div>
    );
  }

  const categories = [...new Set(quote.lineItems.map((item) => item.category))];

  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>Line items</h2>
        <span className="hint">Revision {revision.revisionNumber}</span>
      </div>
      <p className="pane-sub">Generated from BOM R{revision.revisionNumber}. Re-run the enquiry to reprice.</p>
      <div className="quote-grid">
        <div>
          <table className="lineitems">
            <thead>
              <tr>
                <th>Description</th>
                <th className="num">Qty</th>
                <th>Unit</th>
                <th className="num">Rate</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <Fragment key={category}>
                  <tr className="cat-row">
                    <td colSpan={5}>{category}</td>
                  </tr>
                  {quote.lineItems
                    .filter((item) => item.category === category)
                    .map((item, i) => (
                      <tr key={i}>
                        <td>{item.description}</td>
                        <td className="num mono">{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td className="num mono">{item.rate !== null ? `A$${item.rate.toFixed(2)}` : '—'}</td>
                        <td className="num mono">
                          {item.total !== null ? `A$${item.total.toFixed(2)}` : 'unpriced'}
                        </td>
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
          <div className="assumptions">{quote.assumptionsText}</div>
        </div>
        <div className="totals-card">
          <div className="trow">
            <span>Subtotal</span>
            <span className="mono">A${quote.totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="trow">
            <span>Installation</span>
            <span className="mono">A${quote.totals.installation.toFixed(2)}</span>
          </div>
          <div className="trow">
            <span>Contingency</span>
            <span className="mono">A${quote.totals.contingency.toFixed(2)}</span>
          </div>
          <div className="trow grand">
            <span>Total</span>
            <span className="mono">A${quote.totals.total.toFixed(2)}</span>
          </div>
          <a
            className="btn-primary"
            href={quotePdfUrl(projectId, revision.revisionNumber)}
            target="_blank"
            rel="noreferrer"
          >
            Export quotation PDF
          </a>
          <a
            className="btn-secondary"
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
      </div>
    </div>
  );
}
