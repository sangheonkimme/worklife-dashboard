/*
  Warnings:

  - You are about to drop the column `parentId` on the `folders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."folders" DROP CONSTRAINT "folders_parentId_fkey";

-- DropIndex
DROP INDEX "public"."folders_parentId_idx";

-- AlterTable
ALTER TABLE "folders" DROP COLUMN "parentId";
