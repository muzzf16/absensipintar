-- CreateTable
CREATE TABLE "Billing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "principal" REAL NOT NULL,
    "interest" REAL NOT NULL,
    "penalty" REAL NOT NULL,
    "total" REAL NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
