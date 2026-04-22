-- 社区功能数据库迁移
-- 创建时间: 2026-04-22

-- 1. 创建技能评论表
CREATE TABLE IF NOT EXISTS "skill_comments" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_comments_pkey" PRIMARY KEY ("id")
);

-- 2. 创建用户关注表
CREATE TABLE IF NOT EXISTS "user_follows" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("followerId","followingId")
);

-- 3. 创建技能合集表
CREATE TABLE IF NOT EXISTS "skill_collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "skills" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_collections_pkey" PRIMARY KEY ("id")
);

-- 4. 创建通知表
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- 5. 添加索引
CREATE INDEX IF NOT EXISTS "skill_comments_skillId_idx" ON "skill_comments"("skillId");
CREATE INDEX IF NOT EXISTS "skill_comments_userId_idx" ON "skill_comments"("userId");
CREATE INDEX IF NOT EXISTS "skill_comments_parentId_idx" ON "skill_comments"("parentId");
CREATE INDEX IF NOT EXISTS "skill_comments_createdAt_idx" ON "skill_comments"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "user_follows_followerId_idx" ON "user_follows"("followerId");
CREATE INDEX IF NOT EXISTS "user_follows_followingId_idx" ON "user_follows"("followingId");

CREATE INDEX IF NOT EXISTS "skill_collections_userId_idx" ON "skill_collections"("userId");
CREATE INDEX IF NOT EXISTS "skill_collections_isPublic_idx" ON "skill_collections"("isPublic");

CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "notifications_isRead_idx" ON "notifications"("isRead");
CREATE INDEX IF NOT EXISTS "notifications_createdAt_idx" ON "notifications"("createdAt" DESC);

-- 6. 添加外键约束
ALTER TABLE "skill_comments" 
    ADD CONSTRAINT "skill_comments_skillId_fkey" 
    FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE;

ALTER TABLE "skill_comments" 
    ADD CONSTRAINT "skill_comments_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "skill_comments" 
    ADD CONSTRAINT "skill_comments_parentId_fkey" 
    FOREIGN KEY ("parentId") REFERENCES "skill_comments"("id") ON DELETE SET NULL;

ALTER TABLE "user_follows" 
    ADD CONSTRAINT "user_follows_followerId_fkey" 
    FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "user_follows" 
    ADD CONSTRAINT "user_follows_followingId_fkey" 
    FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "skill_collections" 
    ADD CONSTRAINT "skill_collections_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "notifications" 
    ADD CONSTRAINT "notifications_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
