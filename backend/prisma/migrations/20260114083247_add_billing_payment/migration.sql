-- AlterTable
ALTER TABLE "Billing" ADD COLUMN "paidAmount" REAL;
ALTER TABLE "Billing" ADD COLUMN "paidAt" DATETIME;
ALTER TABLE "Billing" ADD COLUMN "paidNote" TEXT;
