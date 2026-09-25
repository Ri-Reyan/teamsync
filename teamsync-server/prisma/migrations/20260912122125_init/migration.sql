-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "task_status" "TaskStatus" NOT NULL DEFAULT 'TODO';
