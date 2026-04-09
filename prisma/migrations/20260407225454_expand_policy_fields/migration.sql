/*
  Warnings:

  - You are about to drop the column `contractorName` on the `Policy` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Policy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Policy" DROP COLUMN "contractorName",
DROP COLUMN "title",
ADD COLUMN     "branch" TEXT,
ADD COLUMN     "brokerContact" TEXT,
ADD COLUMN     "brokerEmail" TEXT,
ADD COLUMN     "brokerName" TEXT,
ADD COLUMN     "brokerPhone" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'MXN',
ADD COLUMN     "grandTotal" DECIMAL(14,2),
ADD COLUMN     "insuredName" TEXT,
ADD COLUMN     "issuanceCost" DECIMAL(14,2),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "policyCost" DECIMAL(14,2),
ADD COLUMN     "policyType" TEXT,
ADD COLUMN     "siteManager" TEXT,
ADD COLUMN     "vat" DECIMAL(14,2),
ALTER COLUMN "status" SET DEFAULT 'EN_PROCESO';
