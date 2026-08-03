import type { Project as PrismaProject } from '@prisma/client';
import { prisma } from './prisma.js';
import type { Project } from './types.js';

function toProject(row: PrismaProject): Project {
  return {
    id: row.id,
    name: row.name,
    client: row.client,
    usageType: row.usageType,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listProjects(): Promise<Project[]> {
  const rows = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map(toProject);
}

export async function getProject(id: string): Promise<Project | undefined> {
  const row = await prisma.project.findUnique({ where: { id } });
  return row ? toProject(row) : undefined;
}

export async function createProject(input: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
  const row = await prisma.project.create({ data: input });
  return toProject(row);
}
