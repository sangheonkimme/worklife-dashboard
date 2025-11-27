-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "folders_userId_updatedAt_idx" ON "folders"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "folders_userId_deletedAt_idx" ON "folders"("userId", "deletedAt");
