/*
  Warnings:

  - You are about to drop the column `issuer_url` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `revocation_list` on the `accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "issuer_url",
DROP COLUMN "revocation_list";

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "issuer_url" TEXT,
ADD COLUMN     "revocation_list" TEXT;
