/*
  Warnings:

  - Added the required column `project_id` to the `summaries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "summaries" ADD COLUMN     "project_id" UUID NOT NULL;
