-- CreateEnum
CREATE TYPE "Command" AS ENUM ('FILECONVERTER', 'REMINDER', 'MUSIC');

-- CreateTable
CREATE TABLE "ChannelBinding" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "bindedCommand" "Command" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelBinding_pkey" PRIMARY KEY ("id")
);
