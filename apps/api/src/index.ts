import Fastify from 'fastify';
import { healthRoutes } from './routes/health.js';
import { projectRoutes } from './routes/projects.js';

const app = Fastify({ logger: true });

await app.register(healthRoutes);
await app.register(projectRoutes);

const port = Number(process.env.PORT ?? 3001);

app
  .listen({ port, host: '0.0.0.0' })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
