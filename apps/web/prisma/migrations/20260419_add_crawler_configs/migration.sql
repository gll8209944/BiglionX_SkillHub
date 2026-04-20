-- CreateTable
CREATE TABLE "crawler_configs" (
    "id" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "configValue" JSONB NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crawler_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crawler_configs_configKey_key" ON "crawler_configs"("configKey");

-- CreateIndex
CREATE INDEX "crawler_configs_configKey_idx" ON "crawler_configs"("configKey");
