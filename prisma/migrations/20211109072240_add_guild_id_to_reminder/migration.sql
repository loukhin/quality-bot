/*
  Warnings:

  - Added the required column `guildId` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "guildId" TEXT NOT NULL;
