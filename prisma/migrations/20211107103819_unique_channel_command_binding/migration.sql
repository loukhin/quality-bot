/*
  Warnings:

  - A unique constraint covering the columns `[guildId,channelId]` on the table `ChannelBinding` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChannelBinding_guildId_channelId_key" ON "ChannelBinding"("guildId", "channelId");
