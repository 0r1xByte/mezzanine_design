import PDFDocument from 'pdfkit';
import type { LineItem, QuoteTotals } from './quote-engine.js';

interface QuotePdfInput {
  projectName: string;
  client: string;
  revisionNumber: number;
  lineItems: LineItem[];
  totals: QuoteTotals;
  assumptionsText: string;
}

const CATEGORY_ORDER = ['Structure', 'Decking', 'Access', 'Paint'];

export function renderQuotePdf(input: QuotePdfInput): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  doc.fontSize(18).font('Helvetica-Bold').text('Mezzanine Floor — Quotation');
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica').fillColor('#5b6675');
  doc.text(`${input.projectName}  |  ${input.client}  |  Revision ${input.revisionNumber}`);
  doc.fillColor('#000000');
  doc.moveDown(1);

  const categories = [...new Set(input.lineItems.map((item) => item.category))].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  );

  const colX = { description: 50, qty: 320, unit: 370, rate: 410, total: 480 };

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#8a93a0');
  doc.text('DESCRIPTION', colX.description, doc.y, { continued: false });
  doc.text('QTY', colX.qty, doc.y - 11);
  doc.text('UNIT', colX.unit, doc.y - 11);
  doc.text('RATE', colX.rate, doc.y - 11);
  doc.text('TOTAL', colX.total, doc.y - 11);
  doc.fillColor('#000000');
  doc.moveDown(0.5);
  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor('#bec6d1')
    .stroke();
  doc.moveDown(0.3);

  for (const category of categories) {
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#5b6675').text(category.toUpperCase());
    doc.fillColor('#000000');
    doc.font('Helvetica').fontSize(10);

    for (const item of input.lineItems.filter((i) => i.category === category)) {
      const y = doc.y;
      doc.text(item.description, colX.description, y, { width: 260 });
      doc.text(String(item.quantity), colX.qty, y);
      doc.text(item.unit, colX.unit, y);
      doc.text(item.rate !== null ? item.rate.toFixed(2) : '—', colX.rate, y);
      doc.text(item.total !== null ? item.total.toFixed(2) : 'unpriced', colX.total, y);
      doc.moveDown(0.4);
    }
    doc.moveDown(0.3);
  }

  doc.moveDown(0.5);
  doc.moveTo(320, doc.y).lineTo(545, doc.y).strokeColor('#bec6d1').stroke();
  doc.moveDown(0.4);

  const totalsRow = (label: string, value: number, bold = false) => {
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 12 : 10);
    doc.text(label, 320, doc.y, { continued: true, width: 150 });
    doc.text(value.toFixed(2), colX.total, doc.y);
  };

  totalsRow('Subtotal', input.totals.subtotal);
  totalsRow('Installation', input.totals.installation);
  totalsRow('Contingency', input.totals.contingency);
  doc.moveDown(0.2);
  totalsRow('Total', input.totals.total, true);

  doc.moveDown(1.5);
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#5b6675').text('ASSUMPTIONS & EXCLUSIONS');
  doc.font('Helvetica').fontSize(9).fillColor('#5b6675');
  doc.moveDown(0.2);
  doc.text(input.assumptionsText, { width: 495 });

  doc.end();
  return doc;
}
