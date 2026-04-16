/*
  Warnings:

  - You are about to drop the column `context` on the `PreAssessment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PreAssessment" DROP COLUMN "context",
ADD COLUMN     "accessibilityNeeds" TEXT,
ADD COLUMN     "medicationHistory" TEXT,
ADD COLUMN     "pastTherapyExperiences" TEXT;
