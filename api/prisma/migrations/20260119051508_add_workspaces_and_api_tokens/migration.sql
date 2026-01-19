-- CreateTable: Workspaces
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPersonal" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ApiTokens
CREATE TABLE "api_tokens" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "api_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_userId_key" ON "workspaces"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "api_tokens_token_key" ON "api_tokens"("token");

-- CreateIndex
CREATE INDEX "api_tokens_userId_idx" ON "api_tokens"("userId");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data Migration: Create personal workspaces for existing users
INSERT INTO "workspaces" ("id", "name", "userId", "isPersonal", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    COALESCE("name", "email") || '''s Workspace',
    "id",
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "users";

-- Add workspaceId column to bookmarks (nullable initially)
ALTER TABLE "bookmarks" ADD COLUMN "workspaceId" TEXT;

-- Migrate existing bookmarks to personal workspaces
UPDATE "bookmarks" b
SET "workspaceId" = w."id"
FROM "workspaces" w
WHERE w."userId" = b."userId" AND w."isPersonal" = true;

-- Make workspaceId NOT NULL now that data is migrated
ALTER TABLE "bookmarks" ALTER COLUMN "workspaceId" SET NOT NULL;

-- Drop old foreign key and userId column from bookmarks
ALTER TABLE "bookmarks" DROP CONSTRAINT IF EXISTS "bookmarks_userId_fkey";
ALTER TABLE "bookmarks" DROP COLUMN "userId";

-- Add new foreign key for workspace
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex for workspaceId on bookmarks (drop old index if exists)
DROP INDEX IF EXISTS "bookmarks_userId_idx";
CREATE INDEX "bookmarks_workspaceId_idx" ON "bookmarks"("workspaceId");

-- Add workspaceId column to tags (nullable initially)
ALTER TABLE "tags" ADD COLUMN "workspaceId" TEXT;

-- Migrate existing tags to all workspaces that use them
-- For each tag, we need to create workspace-specific copies
-- First, let's handle tags that are actually used in bookmarks
WITH tag_workspaces AS (
    SELECT DISTINCT t.id as tag_id, t.name, b."workspaceId"
    FROM "tags" t
    INNER JOIN "_BookmarkToTag" bt ON t.id = bt."B"
    INNER JOIN "bookmarks" b ON bt."A" = b.id
)
INSERT INTO "tags" ("id", "name", "workspaceId", "createdAt")
SELECT 
    gen_random_uuid(),
    tw.name,
    tw."workspaceId",
    CURRENT_TIMESTAMP
FROM tag_workspaces tw;

-- Update bookmark-tag relationships to point to workspace-specific tags
-- Create a temporary mapping table
CREATE TEMP TABLE tag_mapping AS
SELECT 
    bt."A" as bookmark_id,
    ot.id as old_tag_id,
    nt.id as new_tag_id
FROM "_BookmarkToTag" bt
INNER JOIN "tags" ot ON bt."B" = ot.id AND ot."workspaceId" IS NULL
INNER JOIN "bookmarks" b ON bt."A" = b.id
INNER JOIN "tags" nt ON nt.name = ot.name AND nt."workspaceId" = b."workspaceId";

-- Delete old relationships
DELETE FROM "_BookmarkToTag" 
WHERE "B" IN (SELECT id FROM "tags" WHERE "workspaceId" IS NULL);

-- Create new relationships with workspace-specific tags
INSERT INTO "_BookmarkToTag" ("A", "B")
SELECT DISTINCT bookmark_id, new_tag_id
FROM tag_mapping;

-- Delete orphaned global tags (those without workspaceId)
DELETE FROM "tags" WHERE "workspaceId" IS NULL;

-- Make workspaceId NOT NULL
ALTER TABLE "tags" ALTER COLUMN "workspaceId" SET NOT NULL;

-- Drop old unique constraint on tag name if exists
ALTER TABLE "tags" DROP CONSTRAINT IF EXISTS "tags_name_key";

-- Add new composite unique constraint (name + workspaceId)
CREATE UNIQUE INDEX "tags_name_workspaceId_key" ON "tags"("name", "workspaceId");

-- CreateIndex for workspaceId on tags
CREATE INDEX "tags_workspaceId_idx" ON "tags"("workspaceId");

-- Add foreign key for workspace on tags
ALTER TABLE "tags" ADD CONSTRAINT "tags_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
