import type { FastifyInstance } from 'fastify';
import { fetchDesignDxf, type DesignInput } from '../calc-engine-client.js';
import { getDesignRevision } from '../design-revisions-store.js';
import { getProject } from '../projects-store.js';
import type { BomLine } from '../quote-engine.js';
import { computeTotals, type LineItem } from '../quote-engine.js';
import { renderQuotePdf } from '../quote-pdf.js';
import { getQuoteByRevision } from '../quote-store.js';

function bomToCsv(bomLines: BomLine[]): string {
  const header = 'Category,Description,Unit,Quantity,Wastage Factor';
  const rows = bomLines.map(
    (line) =>
      `${line.category},"${line.description}",${line.unit},${line.quantity},${line.wastage_factor}`,
  );
  return [header, ...rows].join('\n');
}

export async function documentRoutes(app: FastifyInstance) {
  app.get('/projects/:id/design-revisions/:revisionNumber/drawing.dxf', async (request, reply) => {
    const { id, revisionNumber } = request.params as { id: string; revisionNumber: string };
    const revision = await getDesignRevision(id, Number(revisionNumber));
    if (!revision) {
      return reply.status(404).send({ error: 'Design revision not found' });
    }
    const dxf = await fetchDesignDxf(revision.input as unknown as DesignInput);
    return reply
      .header('Content-Type', 'application/dxf')
      .header('Content-Disposition', `attachment; filename="floor-plan-r${revisionNumber}.dxf"`)
      .send(Buffer.from(dxf));
  });

  app.get(
    '/projects/:id/design-revisions/:revisionNumber/material-takeoff.csv',
    async (request, reply) => {
      const { id, revisionNumber } = request.params as { id: string; revisionNumber: string };
      const revision = await getDesignRevision(id, Number(revisionNumber));
      if (!revision) {
        return reply.status(404).send({ error: 'Design revision not found' });
      }
      const output = revision.output as unknown as { bom: BomLine[] };
      const csv = bomToCsv(output.bom);
      return reply
        .header('Content-Type', 'text/csv')
        .header(
          'Content-Disposition',
          `attachment; filename="material-takeoff-r${revisionNumber}.csv"`,
        )
        .send(csv);
    },
  );

  app.get('/projects/:id/design-revisions/:revisionNumber/quote/pdf', async (request, reply) => {
    const { id, revisionNumber } = request.params as { id: string; revisionNumber: string };
    const project = await getProject(id);
    const revision = await getDesignRevision(id, Number(revisionNumber));
    if (!project || !revision) {
      return reply.status(404).send({ error: 'Project or design revision not found' });
    }
    const quote = await getQuoteByRevision(revision.id);
    if (!quote) {
      return reply.status(404).send({ error: 'No quote generated for this revision yet' });
    }

    const lineItems = quote.lineItems as unknown as LineItem[];
    const totals = computeTotals(
      lineItems,
      Number(quote.markupPercent),
      Number(quote.contingencyPercent),
      Number(quote.installationTotal),
    );

    reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="quote-r${revisionNumber}.pdf"`);

    const doc = renderQuotePdf({
      projectName: project.name,
      client: project.client,
      revisionNumber: Number(revisionNumber),
      lineItems,
      totals,
      assumptionsText: quote.assumptionsText,
    });

    return reply.send(doc);
  });
}
