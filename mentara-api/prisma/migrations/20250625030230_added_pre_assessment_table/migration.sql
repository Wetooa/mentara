/*
  Warnings:

  - Added the required column `expertiseLevels` to the `Therapist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `illnessSpecializations` to the `Therapist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Therapist" ADD COLUMN     "expertiseLevels" JSONB NOT NULL,
ADD COLUMN     "illnessSpecializations" JSONB NOT NULL,
ADD COLUMN     "patientSatisfaction" DECIMAL(3,2),
ADD COLUMN     "totalPatients" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "treatmentSuccessRates" JSONB;

-- CreateTable
CREATE TABLE "PreAssessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "questionnaires" JSONB NOT NULL,
    "answers" JSONB NOT NULL,
    "answerMatrix" JSONB NOT NULL,
    "scores" JSONB NOT NULL,
    "severityLevels" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreAssessment_userId_key" ON "PreAssessment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PreAssessment_clerkId_key" ON "PreAssessment"("clerkId");

-- CreateIndex
CREATE INDEX "PreAssessment_clerkId_idx" ON "PreAssessment"("clerkId");

-- CreateIndex
CREATE INDEX "PreAssessment_userId_idx" ON "PreAssessment"("userId");

-- CreateIndex
CREATE INDEX "Therapist_isActive_idx" ON "Therapist"("isActive");

-- CreateIndex
CREATE INDEX "Therapist_isVerified_idx" ON "Therapist"("isVerified");

-- AddForeignKey
ALTER TABLE "PreAssessment" ADD CONSTRAINT "PreAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
