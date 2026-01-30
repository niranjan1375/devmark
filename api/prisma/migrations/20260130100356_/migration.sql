/*
  Warnings:

  - The primary key for the `_BookmarkToTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_BookmarkToTag` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_BookmarkToTag" DROP CONSTRAINT "_BookmarkToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_BookmarkToTag" DROP CONSTRAINT "_BookmarkToTag_B_fkey";

-- DropForeignKey
ALTER TABLE "api_tokens" DROP CONSTRAINT "api_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "workspaces" DROP CONSTRAINT "workspaces_userId_fkey";

-- DropIndex
DROP INDEX "tags_name_key";

-- AlterTable
ALTER TABLE "_BookmarkToTag" DROP CONSTRAINT "_BookmarkToTag_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_BookmarkToTag_AB_unique" ON "_BookmarkToTag"("A", "B");
