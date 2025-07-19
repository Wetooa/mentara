/*
  Warnings:

  - You are about to drop the `WorksheetMaterial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorksheetSubmission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorksheetMaterial" DROP CONSTRAINT "WorksheetMaterial_worksheetId_fkey";

-- DropForeignKey
ALTER TABLE "WorksheetSubmission" DROP CONSTRAINT "WorksheetSubmission_clientId_fkey";

-- DropForeignKey
ALTER TABLE "WorksheetSubmission" DROP CONSTRAINT "WorksheetSubmission_worksheetId_fkey";

-- AlterTable
ALTER TABLE "Worksheet" ADD COLUMN     "materialNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "materialSizes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "materialUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "submissionNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "submissionSizes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "submissionUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "WorksheetMaterial";

-- DropTable
DROP TABLE "WorksheetSubmission";
