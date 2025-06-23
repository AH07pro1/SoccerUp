-- DropForeignKey
ALTER TABLE "Drill" DROP CONSTRAINT "Drill_sessionId_fkey";

-- AlterTable
ALTER TABLE "Drill" ALTER COLUMN "sessionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Drill" ADD CONSTRAINT "Drill_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
