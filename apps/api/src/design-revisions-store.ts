import type { DesignInput } from './calc-engine-client.js';
import { runDesign } from './calc-engine-client.js';
import { prisma } from './prisma.js';

export async function createDesignRevision(projectId: string, input: DesignInput, createdBy?: string) {
  const output = await runDesign(input);

  const last = await prisma.designRevision.findFirst({
    where: { projectId },
    orderBy: { revisionNumber: 'desc' },
  });
  const revisionNumber = (last?.revisionNumber ?? 0) + 1;

  return prisma.designRevision.create({
    data: {
      projectId,
      revisionNumber,
      createdBy,
      input: input as object,
      output: output as object,
    },
  });
}

export async function listDesignRevisions(projectId: string) {
  return prisma.designRevision.findMany({
    where: { projectId },
    orderBy: { revisionNumber: 'desc' },
  });
}

export async function getDesignRevision(projectId: string, revisionNumber: number) {
  return prisma.designRevision.findUnique({
    where: { projectId_revisionNumber: { projectId, revisionNumber } },
  });
}

export async function getLatestDesignRevision(projectId: string) {
  return prisma.designRevision.findFirst({
    where: { projectId },
    orderBy: { revisionNumber: 'desc' },
  });
}

export async function getDesignRevisionById(id: string) {
  return prisma.designRevision.findUnique({ where: { id } });
}
