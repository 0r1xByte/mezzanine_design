import type { FastifyInstance } from 'fastify';
import { CalcEngineError } from '../calc-engine-client.js';
import { buildImpactReport } from '../change-impact.js';
import {
  createDesignRevision,
  getDesignRevision,
  getLatestDesignRevision,
  listDesignRevisions,
} from '../design-revisions-store.js';
import { getProject } from '../projects-store.js';

interface CreateDesignRevisionBody {
  geometry: unknown;
  loads?: unknown;
  structural_config?: unknown;
  createdBy?: string;
}

export async function designRevisionRoutes(app: FastifyInstance) {
  app.post('/projects/:id/design-revisions', async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = await getProject(id);
    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const body = request.body as CreateDesignRevisionBody;
    if (!body?.geometry) {
      return reply.status(400).send({ error: 'geometry is required' });
    }

    try {
      const revision = await createDesignRevision(
        id,
        { geometry: body.geometry, loads: body.loads, structural_config: body.structural_config },
        body.createdBy,
      );
      return reply.status(201).send(revision);
    } catch (err) {
      if (err instanceof CalcEngineError) {
        return reply.status(502).send({ error: err.message });
      }
      throw err;
    }
  });

  app.get('/projects/:id/design-revisions', async (request) => {
    const { id } = request.params as { id: string };
    return listDesignRevisions(id);
  });

  app.get('/projects/:id/design-revisions/latest', async (request, reply) => {
    const { id } = request.params as { id: string };
    const revision = await getLatestDesignRevision(id);
    if (!revision) {
      return reply.status(404).send({ error: 'No design revisions for this project yet' });
    }
    return revision;
  });

  app.get('/projects/:id/design-revisions/compare', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { from, to } = request.query as { from?: string; to?: string };
    if (!from || !to) {
      return reply.status(400).send({ error: 'from and to query params (revision numbers) are required' });
    }
    const [fromRevision, toRevision] = await Promise.all([
      getDesignRevision(id, Number(from)),
      getDesignRevision(id, Number(to)),
    ]);
    if (!fromRevision || !toRevision) {
      return reply.status(404).send({ error: 'One or both revisions were not found' });
    }
    return buildImpactReport(fromRevision, toRevision);
  });

  app.get('/projects/:id/design-revisions/:revisionNumber', async (request, reply) => {
    const { id, revisionNumber } = request.params as { id: string; revisionNumber: string };
    const revision = await getDesignRevision(id, Number(revisionNumber));
    if (!revision) {
      return reply.status(404).send({ error: 'Design revision not found' });
    }
    return revision;
  });

  app.get('/projects/:id/design-revisions/:revisionNumber/impact', async (request, reply) => {
    const { id, revisionNumber } = request.params as { id: string; revisionNumber: string };
    const toNumber = Number(revisionNumber);
    const [fromRevision, toRevision] = await Promise.all([
      getDesignRevision(id, toNumber - 1),
      getDesignRevision(id, toNumber),
    ]);
    if (!toRevision) {
      return reply.status(404).send({ error: 'Design revision not found' });
    }
    if (!fromRevision) {
      return reply.status(200).send({
        fromRevision: null,
        toRevision: toNumber,
        changedInputSections: [],
        memberChanges: [],
        metricChanges: [],
        warningChanges: [],
        unchanged: false,
        note: 'This is the first revision — nothing to compare against.',
      });
    }
    return buildImpactReport(fromRevision, toRevision);
  });
}
