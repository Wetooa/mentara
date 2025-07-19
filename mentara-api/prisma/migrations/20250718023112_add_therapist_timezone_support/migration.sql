-- AlterTable
ALTER TABLE "Therapist" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- CreateIndex
CREATE INDEX "Therapist_timezone_idx" ON "Therapist"("timezone");
