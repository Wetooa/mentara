-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "illness" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "memberCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "postCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Community_illness_idx" ON "Community"("illness");
