import type { FastifyInstance } from 'fastify';
import { createProject, getProject, listProjects } from '../projects-store.js';

interface CreateProjectBody {
  name: string;
  client: string;
  usageType: 'storage' | 'office' | 'retail';
}

export async function projectRoutes(app: FastifyInstance) {
  app.get('/projects', async () => listProjects());

  app.get('/projects/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = await getProject(id);
    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }
    return project;
  });

  app.post('/projects', async (request, reply) => {
    const body = request.body as CreateProjectBody;
    if (!body?.name || !body?.client || !body?.usageType) {
      return reply.status(400).send({ error: 'name, client, and usageType are required' });
    }
    const project = await createProject({ ...body, status: 'enquiry' });
    return reply.status(201).send(project);
  });
}
