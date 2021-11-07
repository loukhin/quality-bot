-- CreateEnum
CREATE TYPE "MusicStatus" AS ENUM ('UNPLAYED', 'PLAYING', 'PAUSED', 'PLAYED');

-- CreateTable
CREATE TABLE "Music" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "MusicStatus" NOT NULL DEFAULT E'UNPLAYED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Music_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "describtion" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);
