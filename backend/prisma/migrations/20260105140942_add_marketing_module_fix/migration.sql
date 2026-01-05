-- AlterTable
ALTER TABLE "Visit" ADD COLUMN "followUpAt" DATETIME;
ALTER TABLE "Visit" ADD COLUMN "marketingNotes" TEXT;
ALTER TABLE "Visit" ADD COLUMN "potentialValue" DECIMAL;
ALTER TABLE "Visit" ADD COLUMN "prospectStatus" TEXT;

-- CreateTable
CREATE TABLE "VisitProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "prospectStatus" TEXT,
    "potentialValue" DECIMAL,
    CONSTRAINT "VisitProduct_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
