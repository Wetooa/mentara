-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "encryptionAuthTag" TEXT,
ADD COLUMN     "encryptionIv" TEXT,
ADD COLUMN     "encryptionKeyId" TEXT,
ADD COLUMN     "isEncrypted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Message_isEncrypted_idx" ON "Message"("isEncrypted");

-- CreateIndex
CREATE INDEX "Message_encryptionKeyId_idx" ON "Message"("encryptionKeyId");
