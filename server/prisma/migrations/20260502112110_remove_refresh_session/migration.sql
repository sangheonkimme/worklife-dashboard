/*
  Warnings:

  - You are about to drop the `refresh_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."refresh_sessions" DROP CONSTRAINT "refresh_sessions_userId_fkey";

-- DropTable
DROP TABLE "public"."refresh_sessions";
