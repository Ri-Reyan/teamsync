/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `workspaces` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Package" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "package" "Package" NOT NULL DEFAULT 'STARTER';

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_name_key" ON "workspaces"("name");
