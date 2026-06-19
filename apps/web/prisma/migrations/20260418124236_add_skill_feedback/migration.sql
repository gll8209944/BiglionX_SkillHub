-- CreateTable
CREATE TABLE "skill_feedbacks" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "userId" TEXT,
    "feedbackType" TEXT NOT NULL,
    "currentCategory" TEXT,
    "suggestedCategory" TEXT,
    "currentSubcategory" TEXT,
    "suggestedSubcategory" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "skill_feedbacks_skillId_idx" ON "skill_feedbacks"("skillId");

-- CreateIndex
CREATE INDEX "skill_feedbacks_userId_idx" ON "skill_feedbacks"("userId");

-- CreateIndex
CREATE INDEX "skill_feedbacks_status_idx" ON "skill_feedbacks"("status");

-- CreateIndex
CREATE INDEX "skill_feedbacks_createdAt_idx" ON "skill_feedbacks"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "skill_feedbacks" ADD CONSTRAINT "skill_feedbacks_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_feedbacks" ADD CONSTRAINT "skill_feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
