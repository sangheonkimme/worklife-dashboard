/*
  Warnings:

  - You are about to drop the column `durationSec` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `tag` on the `note_tags` table. All the data in the column will be lost.
  - You are about to drop the column `checklist` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `encrypted` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `links` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHint` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `pinned` on the `notes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[noteId,tagId]` on the table `note_tags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileName` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `attachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagId` to the `note_tags` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('TEXT', 'CHECKLIST', 'MARKDOWN', 'QUICK');

-- DropIndex
DROP INDEX "public"."note_tags_noteId_tag_key";

-- DropIndex
DROP INDEX "public"."note_tags_tag_idx";

-- DropIndex
DROP INDEX "public"."notes_updatedAt_idx";

-- DropIndex
DROP INDEX "public"."notes_userId_deletedAt_idx";

-- DropIndex
DROP INDEX "public"."notes_userId_pinned_idx";

-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "durationSec",
DROP COLUMN "filename",
DROP COLUMN "height",
DROP COLUMN "size",
DROP COLUMN "width",
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "note_tags" DROP COLUMN "tag",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tagId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "notes" DROP COLUMN "checklist",
DROP COLUMN "encrypted",
DROP COLUMN "links",
DROP COLUMN "passwordHint",
DROP COLUMN "pinned",
ADD COLUMN     "folderId" TEXT,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "type" "NoteType" NOT NULL DEFAULT 'TEXT';

-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "parentId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "noteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "type" "NoteType" NOT NULL DEFAULT 'TEXT',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "note_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_transactions" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "folders_userId_idx" ON "folders"("userId");

-- CreateIndex
CREATE INDEX "folders_parentId_idx" ON "folders"("parentId");

-- CreateIndex
CREATE INDEX "tags_userId_idx" ON "tags"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_userId_name_key" ON "tags"("userId", "name");

-- CreateIndex
CREATE INDEX "checklist_items_noteId_order_idx" ON "checklist_items"("noteId", "order");

-- CreateIndex
CREATE INDEX "note_templates_userId_idx" ON "note_templates"("userId");

-- CreateIndex
CREATE INDEX "note_transactions_noteId_idx" ON "note_transactions"("noteId");

-- CreateIndex
CREATE INDEX "note_transactions_transactionId_idx" ON "note_transactions"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "note_transactions_noteId_transactionId_key" ON "note_transactions"("noteId", "transactionId");

-- CreateIndex
CREATE INDEX "attachments_hash_idx" ON "attachments"("hash");

-- CreateIndex
CREATE INDEX "note_tags_noteId_idx" ON "note_tags"("noteId");

-- CreateIndex
CREATE INDEX "note_tags_tagId_idx" ON "note_tags"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "note_tags_noteId_tagId_key" ON "note_tags"("noteId", "tagId");

-- CreateIndex
CREATE INDEX "notes_userId_createdAt_idx" ON "notes"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notes_userId_updatedAt_idx" ON "notes"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "notes_userId_isPinned_idx" ON "notes"("userId", "isPinned");

-- CreateIndex
CREATE INDEX "notes_userId_isFavorite_idx" ON "notes"("userId", "isFavorite");

-- CreateIndex
CREATE INDEX "notes_folderId_idx" ON "notes"("folderId");

-- CreateIndex
CREATE INDEX "notes_deletedAt_idx" ON "notes"("deletedAt");

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_tags" ADD CONSTRAINT "note_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_templates" ADD CONSTRAINT "note_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_transactions" ADD CONSTRAINT "note_transactions_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_transactions" ADD CONSTRAINT "note_transactions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
