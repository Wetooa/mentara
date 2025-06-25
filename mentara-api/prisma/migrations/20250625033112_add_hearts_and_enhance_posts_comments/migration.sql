/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Community` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Community` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "heartCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "illness" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "memberCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "postCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "heartCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CommentHeart" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentHeart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostHeart" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostHeart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommentHeart_commentId_idx" ON "CommentHeart"("commentId");

-- CreateIndex
CREATE INDEX "CommentHeart_userId_idx" ON "CommentHeart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentHeart_commentId_userId_key" ON "CommentHeart"("commentId", "userId");

-- CreateIndex
CREATE INDEX "PostHeart_postId_idx" ON "PostHeart"("postId");

-- CreateIndex
CREATE INDEX "PostHeart_userId_idx" ON "PostHeart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostHeart_postId_userId_key" ON "PostHeart"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");

-- CreateIndex
CREATE INDEX "Community_illness_idx" ON "Community"("illness");

-- CreateIndex
CREATE INDEX "Community_isActive_idx" ON "Community"("isActive");

-- CreateIndex
CREATE INDEX "Community_slug_idx" ON "Community"("slug");

-- AddForeignKey
ALTER TABLE "CommentHeart" ADD CONSTRAINT "CommentHeart_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentHeart" ADD CONSTRAINT "CommentHeart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHeart" ADD CONSTRAINT "PostHeart_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHeart" ADD CONSTRAINT "PostHeart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
