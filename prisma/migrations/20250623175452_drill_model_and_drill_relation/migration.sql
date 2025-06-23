/*
  Warnings:

  - You are about to drop the column `drills` on the `Session` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DrillCategory" AS ENUM ('passing', 'shooting', 'dribbling', 'defending', 'goalkeeping', 'fitness');

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "drills";

-- CreateTable
CREATE TABLE "Drill" (
    "id" SERIAL NOT NULL,
    "drillName" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "numberOfSets" INTEGER NOT NULL,
    "numberOfReps" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "visualReference" TEXT,
    "drillCategory" "DrillCategory" NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "materials" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drill_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Drill" ADD CONSTRAINT "Drill_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
