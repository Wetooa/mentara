-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'mental-health';

-- CreateTable
CREATE TABLE "CommunityTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "CommunityTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityToTag" (
    "communityId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "CommunityToTag_pkey" PRIMARY KEY ("communityId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityTag_name_key" ON "CommunityTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityTag_slug_key" ON "CommunityTag"("slug");

-- CreateIndex
CREATE INDEX "CommunityTag_name_idx" ON "CommunityTag"("name");

-- CreateIndex
CREATE INDEX "CommunityTag_slug_idx" ON "CommunityTag"("slug");

-- CreateIndex
CREATE INDEX "CommunityToTag_communityId_idx" ON "CommunityToTag"("communityId");

-- CreateIndex
CREATE INDEX "CommunityToTag_tagId_idx" ON "CommunityToTag"("tagId");

-- AddForeignKey
ALTER TABLE "CommunityToTag" ADD CONSTRAINT "CommunityToTag_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityToTag" ADD CONSTRAINT "CommunityToTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "CommunityTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
