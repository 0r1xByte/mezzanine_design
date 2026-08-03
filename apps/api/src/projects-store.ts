import { randomUUID } from 'node:crypto';
import type { Project } from './types.js';

// In-memory store — placeholder until Postgres/Prisma is wired up (PLAN.md Phase 2).
const projects: Project[] = [
  {
    id: randomUUID(),
    name: 'Riverside Distribution — Mezzanine B',
    client: 'Halden Logistics',
    usageType: 'storage',
    status: 'draft',
    createdAt: new Date().toISOString(),
  },
];

export function listProjects(): Project[] {
  return projects;
}

export function getProject(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

export function createProject(input: Omit<Project, 'id' | 'createdAt'>): Project {
  const project: Project = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  projects.push(project);
  return project;
}
