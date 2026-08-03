-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('storage', 'office', 'retail');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('enquiry', 'draft', 'reviewed', 'quoted');

-- CreateEnum
CREATE TYPE "RevisionStatus" AS ENUM ('draft', 'reviewed', 'superseded');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "usageType" "UsageType" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'enquiry',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignRevision" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "status" "RevisionStatus" NOT NULL DEFAULT 'draft',
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,

    CONSTRAINT "DesignRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceBookEntry" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "rate" DECIMAL(10,2) NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'default',
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceBookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "designRevisionId" TEXT NOT NULL,
    "lineItems" JSONB NOT NULL,
    "overrides" JSONB,
    "markupPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "contingencyPercent" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "installationTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "assumptionsText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DesignRevision_projectId_revisionNumber_key" ON "DesignRevision"("projectId", "revisionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_designRevisionId_key" ON "Quote"("designRevisionId");

-- AddForeignKey
ALTER TABLE "DesignRevision" ADD CONSTRAINT "DesignRevision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_designRevisionId_fkey" FOREIGN KEY ("designRevisionId") REFERENCES "DesignRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;
