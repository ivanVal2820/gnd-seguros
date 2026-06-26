-- AlterTable
ALTER TABLE "Insurer" ADD COLUMN     "contact" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "Policy" ADD COLUMN     "policyCount" INTEGER NOT NULL DEFAULT 1;
