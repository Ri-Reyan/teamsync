/*
  Warnings:

  - You are about to drop the column `user_id` on the `summaries` table. All the data in the column will be lost.
  - Added the required column `owner_id` to the `summaries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "summaries" DROP COLUMN "user_id",
ADD COLUMN     "owner_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "summaries" ADD CONSTRAINT "summaries_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
