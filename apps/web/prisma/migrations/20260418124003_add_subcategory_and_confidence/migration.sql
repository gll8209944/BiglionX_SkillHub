-- AlterTable
ALTER TABLE "skills" ADD COLUMN     "authorName" TEXT,
ADD COLUMN     "authorUrl" TEXT,
ADD COLUMN     "compatibility" JSONB,
ADD COLUMN     "confidence" DOUBLE PRECISION NOT NULL DEFAULT 70,
ADD COLUMN     "dependencies" JSONB,
ADD COLUMN     "documentationUrl" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "permissions" JSONB,
ADD COLUMN     "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "repositoryUrl" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "starCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subcategory" TEXT,
ADD COLUMN     "syncStatus" TEXT;

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'running',
    "errorMessage" TEXT,
    "metadata" JSONB,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crawler_tasks" (
    "id" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crawler_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sync_logs_source_idx" ON "sync_logs"("source");

-- CreateIndex
CREATE INDEX "sync_logs_startedAt_idx" ON "sync_logs"("startedAt" DESC);

-- CreateIndex
CREATE INDEX "crawler_tasks_status_idx" ON "crawler_tasks"("status");

-- CreateIndex
CREATE INDEX "crawler_tasks_scheduledAt_idx" ON "crawler_tasks"("scheduledAt");

-- CreateIndex
CREATE INDEX "crawler_tasks_createdAt_idx" ON "crawler_tasks"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "skills_source_idx" ON "skills"("source");

-- CreateIndex
CREATE INDEX "skills_sourceId_idx" ON "skills"("sourceId");

-- CreateIndex
CREATE INDEX "skills_qualityScore_idx" ON "skills"("qualityScore" DESC);

-- CreateIndex
CREATE INDEX "skills_updatedAt_idx" ON "skills"("updatedAt" DESC);
