import type { FastifyInstance } from 'fastify';
import { getDesignRevision } from '../design-revisions-store.js';
import { getProject } from '../projects-store.js';
import type { CreateQuoteInput } from '../quote-store.js';
import { createQuote, getQuoteById, getQuoteByRevision, withTotals } from '../quote-store.js';

export async function quoteRoutes(app: FastifyInstance) {
  app.post('/projects/:id/design-revisions/:revisionNumber/quote', async (request, reply) => {
    const { id, revisionNumber } = request.params as { id: string; revisionNumber: string };
    const project = await getProject(id);
    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }
    const revision = await getDesignRevision(id, Number(revisionNumber));
    if (!revision) {
      return reply.status(404).send({ error: 'Design revision not found' });
    }

    const body = request.body as CreateQuoteInput;
    const quote = await createQuote(revision.id, body ?? {});
    if (!quote) {
      return reply.status(404).send({ error: 'Design revision not found' });
    }
    return reply.status(201).send(withTotals(quote));
  });

  app.get('/projects/:id/design-revisions/:revisionNumber/quote', async (request, reply) => {
    const { id, revisionNumber } = request.params as { id: string; revisionNumber: string };
    const revision = await getDesignRevision(id, Number(revisionNumber));
    if (!revision) {
      return reply.status(404).send({ error: 'Design revision not found' });
    }
    const quote = await getQuoteByRevision(revision.id);
    if (!quote) {
      return reply.status(404).send({ error: 'No quote generated for this revision yet' });
    }
    return withTotals(quote);
  });

  app.get('/quotes/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const quote = await getQuoteById(id);
    if (!quote) {
      return reply.status(404).send({ error: 'Quote not found' });
    }
    return withTotals(quote);
  });
}
