import { Fragment } from 'react';
import { quoteAssumptions, quoteCategories, quoteTotals } from '../data/mock';
import './QuoteScreen.css';

export function QuoteScreen() {
  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>Line items</h2>
        <span className="hint">Option A — 5.0 kN/m², no fire rating</span>
      </div>
      <p className="pane-sub">
        Generated from BOM R4. Adjust quantities or rates here without touching the design.
      </p>
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
              {quoteCategories.map((category) => (
                <Fragment key={category.name}>
                  <tr className="cat-row">
                    <td colSpan={5}>{category.name}</td>
                  </tr>
                  {category.items.map((item) => (
                    <tr key={item.description}>
                      <td>{item.description}</td>
                      <td className="num mono">{item.qty}</td>
                      <td>{item.unit}</td>
                      <td className="num mono">{item.rate}</td>
                      <td className="num mono">{item.total}</td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
          <div className="assumptions">{quoteAssumptions}</div>
        </div>
        <div className="totals-card">
          <div className="trow">
            <span>Subtotal</span>
            <span className="mono">{quoteTotals.subtotal}</span>
          </div>
          <div className="trow">
            <span>Installation</span>
            <span className="mono">{quoteTotals.installation}</span>
          </div>
          <div className="trow">
            <span>Contingency (5%)</span>
            <span className="mono">{quoteTotals.contingency}</span>
          </div>
          <div className="trow grand">
            <span>Total</span>
            <span className="mono">{quoteTotals.total}</span>
          </div>
          <button type="button" className="btn-primary">
            Export quotation PDF
          </button>
        </div>
      </div>
    </div>
  );
}
