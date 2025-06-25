-- AlterTable
ALTER TABLE "User" ADD COLUMN     "therapistId" TEXT;

-- CreateIndex
CREATE INDEX "User_therapistId_idx" ON "User"("therapistId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE SET NULL ON UPDATE CASCADE;
