import './DemoBanner.css';

export function DemoBanner() {
  return (
    <div className="demo-banner">
      <strong>Static preview.</strong> This GitHub Pages build has no backend behind it — the
      Enquiry form, Design &amp; BOM, and Quote screens need <code>apps/api</code> and{' '}
      <code>services/calc-engine</code> running locally (see the repo README) to actually work.
      Loads, Pricing, and Drawings are also not built yet.
    </div>
  );
}
