-- CreateEnum
CREATE TYPE "LanguageCode" AS ENUM ('ko', 'en', 'system');

-- AlterTable
ALTER TABLE "user_settings"
ADD COLUMN     "language" "LanguageCode" NOT NULL DEFAULT 'system';
