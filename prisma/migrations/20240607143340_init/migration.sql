/*
  Warnings:

  - The values [SENDING,ACCEPTED,APPROVED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `certificate` on the `orders` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('SUBMITTED', 'PENDING', 'REJECTED', 'ISSUED', 'VERIFIED');
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "certificate",
ADD COLUMN     "signed_certificate" JSONB,
ADD COLUMN     "unsigned_certififcate" JSONB;
