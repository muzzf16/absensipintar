-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Billing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "officeId" TEXT,
    "customerName" TEXT NOT NULL,
    "principal" REAL NOT NULL,
    "interest" REAL NOT NULL,
    "penalty" REAL NOT NULL,
    "total" REAL NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Billing_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Billing" ("customerName", "dueDate", "id", "interest", "isPaid", "penalty", "principal", "total", "uploadedAt") SELECT "customerName", "dueDate", "id", "interest", "isPaid", "penalty", "principal", "total", "uploadedAt" FROM "Billing";
DROP TABLE "Billing";
ALTER TABLE "new_Billing" RENAME TO "Billing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
