import type { FastifyInstance } from 'fastify';
import {
  createPriceBookEntry,
  deletePriceBookEntry,
  getPriceBookEntry,
  listPriceBook,
  updatePriceBookEntry,
  type PriceBookEntryInput,
} from '../price-book-store.js';

export async function priceBookRoutes(app: FastifyInstance) {
  app.get('/price-book', async (request) => {
    const { region } = request.query as { region?: string };
    return listPriceBook(region);
  });

  app.post('/price-book', async (request, reply) => {
    const body = request.body as Partial<PriceBookEntryInput>;
    if (!body?.category || !body?.description || !body?.unit || body?.rate === undefined) {
      return reply.status(400).send({ error: 'category, description, unit, and rate are required' });
    }
    const entry = await createPriceBookEntry({
      category: body.category,
      description: body.description,
      unit: body.unit,
      rate: body.rate,
      region: body.region,
    });
    return reply.status(201).send(entry);
  });

  app.put('/price-book/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = await getPriceBookEntry(id);
    if (!existing) {
      return reply.status(404).send({ error: 'Price book entry not found' });
    }
    const body = request.body as Partial<PriceBookEntryInput>;
    return updatePriceBookEntry(id, body);
  });

  app.delete('/price-book/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = await getPriceBookEntry(id);
    if (!existing) {
      return reply.status(404).send({ error: 'Price book entry not found' });
    }
    await deletePriceBookEntry(id);
    return reply.status(204).send();
  });
}
