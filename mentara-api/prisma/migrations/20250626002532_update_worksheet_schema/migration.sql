/*
  Warnings:

  - You are about to drop the column `type` on the `WorksheetMaterial` table. All the data in the column will be lost.
  - Added the required column `dueDate` to the `Worksheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `WorksheetMaterial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `WorksheetSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `WorksheetSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WorksheetMaterial" DROP CONSTRAINT "WorksheetMaterial_worksheetId_fkey";

-- DropForeignKey
ALTER TABLE "WorksheetSubmission" DROP CONSTRAINT "WorksheetSubmission_worksheetId_fkey";

-- AlterTable
ALTER TABLE "Worksheet" ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'upcoming',
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WorksheetMaterial" DROP COLUMN "type",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "filename" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorksheetSubmission" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Worksheet_status_idx" ON "Worksheet"("status");

-- CreateIndex
CREATE INDEX "Worksheet_isCompleted_idx" ON "Worksheet"("isCompleted");

-- AddForeignKey
ALTER TABLE "WorksheetMaterial" ADD CONSTRAINT "WorksheetMaterial_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "Worksheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorksheetSubmission" ADD CONSTRAINT "WorksheetSubmission_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "Worksheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
