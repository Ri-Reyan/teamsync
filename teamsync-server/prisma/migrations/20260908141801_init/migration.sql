/*
  Warnings:

  - You are about to drop the column `user_id` on the `invitations` table. All the data in the column will be lost.
  - Added the required column `sender_id` to the `invitations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_user_id_fkey";

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "user_id",
ADD COLUMN     "sender_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
