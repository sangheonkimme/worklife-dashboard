/*
  Warnings:

  - You are about to drop the column `icon` on the `folders` table. All the data in the column will be lost.
  - You are about to drop the `note_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."note_tags" DROP CONSTRAINT "note_tags_noteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."note_tags" DROP CONSTRAINT "note_tags_tagId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tags" DROP CONSTRAINT "tags_userId_fkey";

-- AlterTable
ALTER TABLE "folders" DROP COLUMN "icon",
ADD COLUMN     "sortOrder" INTEGER;

-- DropTable
DROP TABLE "public"."note_tags";

-- DropTable
DROP TABLE "public"."tags";
