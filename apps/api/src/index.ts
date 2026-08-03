import Fastify from 'fastify';
import { designRevisionRoutes } from './routes/design-revisions.js';
import { documentRoutes } from './routes/documents.js';
import { healthRoutes } from './routes/health.js';
import { priceBookRoutes } from './routes/price-book.js';
import { projectRoutes } from './routes/projects.js';
import { quoteRoutes } from './routes/quotes.js';

const app = Fastify({ logger: true });

await app.register(healthRoutes);
await app.register(projectRoutes);
await app.register(designRevisionRoutes);
await app.register(priceBookRoutes);
await app.register(quoteRoutes);
await app.register(documentRoutes);

const port = Number(process.env.PORT ?? 3001);

app
  .listen({ port, host: '0.0.0.0' })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
