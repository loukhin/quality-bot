/*
  Warnings:

  - A unique constraint covering the columns `[id,guildId,userId]` on the table `Reminder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reminder_id_guildId_userId_key" ON "Reminder"("id", "guildId", "userId");
