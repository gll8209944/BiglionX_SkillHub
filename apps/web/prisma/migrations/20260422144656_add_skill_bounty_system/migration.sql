/*
  Warnings:

  - Changed the type of `type` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('COMMENT_REPLY', 'SKILL_RATED', 'FOLLOW', 'SKILL_UPDATED', 'MENTION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "BountyStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REVISION');

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "skill_collections" DROP CONSTRAINT "skill_collections_userId_fkey";

-- DropForeignKey
ALTER TABLE "skill_comments" DROP CONSTRAINT "skill_comments_parentId_fkey";

-- DropForeignKey
ALTER TABLE "skill_comments" DROP CONSTRAINT "skill_comments_skillId_fkey";

-- DropForeignKey
ALTER TABLE "skill_comments" DROP CONSTRAINT "skill_comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_follows" DROP CONSTRAINT "user_follows_followerId_fkey";

-- DropForeignKey
ALTER TABLE "user_follows" DROP CONSTRAINT "user_follows_followingId_fkey";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "skills" ADD COLUMN     "embedding" JSONB,
ADD COLUMN     "embeddingVector" DOUBLE PRECISION[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isDisabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "skill_bounties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "reward" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "status" "BountyStatus" NOT NULL DEFAULT 'OPEN',
    "creatorId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "skillId" TEXT,
    "deadline" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_bounties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bounty_applications" (
    "id" TEXT NOT NULL,
    "bountyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proposal" TEXT NOT NULL,
    "estimatedTime" TEXT,
    "portfolio" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,

    CONSTRAINT "bounty_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bounty_submissions" (
    "id" TEXT NOT NULL,
    "bountyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "attachments" JSONB,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "bounty_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playing_with_neon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" REAL,

    CONSTRAINT "playing_with_neon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "skill_bounties_creatorId_idx" ON "skill_bounties"("creatorId");

-- CreateIndex
CREATE INDEX "skill_bounties_assigneeId_idx" ON "skill_bounties"("assigneeId");

-- CreateIndex
CREATE INDEX "skill_bounties_status_idx" ON "skill_bounties"("status");

-- CreateIndex
CREATE INDEX "skill_bounties_createdAt_idx" ON "skill_bounties"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "bounty_applications_bountyId_idx" ON "bounty_applications"("bountyId");

-- CreateIndex
CREATE INDEX "bounty_applications_userId_idx" ON "bounty_applications"("userId");

-- CreateIndex
CREATE INDEX "bounty_applications_status_idx" ON "bounty_applications"("status");

-- CreateIndex
CREATE INDEX "bounty_applications_createdAt_idx" ON "bounty_applications"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "bounty_applications_bountyId_userId_key" ON "bounty_applications"("bountyId", "userId");

-- CreateIndex
CREATE INDEX "bounty_submissions_bountyId_idx" ON "bounty_submissions"("bountyId");

-- CreateIndex
CREATE INDEX "bounty_submissions_userId_idx" ON "bounty_submissions"("userId");

-- CreateIndex
CREATE INDEX "bounty_submissions_status_idx" ON "bounty_submissions"("status");

-- CreateIndex
CREATE INDEX "bounty_submissions_createdAt_idx" ON "bounty_submissions"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "skills_authorId_createdAt_idx" ON "skills"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "skills_authorId_status_idx" ON "skills"("authorId", "status");

-- CreateIndex
CREATE INDEX "skills_authorId_downloadCount_idx" ON "skills"("authorId", "downloadCount");

-- AddForeignKey
ALTER TABLE "skill_comments" ADD CONSTRAINT "skill_comments_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_comments" ADD CONSTRAINT "skill_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_comments" ADD CONSTRAINT "skill_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "skill_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_collections" ADD CONSTRAINT "skill_collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_bounties" ADD CONSTRAINT "skill_bounties_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_bounties" ADD CONSTRAINT "skill_bounties_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_bounties" ADD CONSTRAINT "skill_bounties_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bounty_applications" ADD CONSTRAINT "bounty_applications_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "skill_bounties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bounty_applications" ADD CONSTRAINT "bounty_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bounty_submissions" ADD CONSTRAINT "bounty_submissions_bountyId_fkey" FOREIGN KEY ("bountyId") REFERENCES "skill_bounties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bounty_submissions" ADD CONSTRAINT "bounty_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
