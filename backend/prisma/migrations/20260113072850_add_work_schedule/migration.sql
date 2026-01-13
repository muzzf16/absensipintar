-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Office" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "radius" INTEGER NOT NULL DEFAULT 100,
    "workStartTime" TEXT NOT NULL DEFAULT '08:00',
    "workEndTime" TEXT NOT NULL DEFAULT '17:00',
    "gracePeriod" INTEGER NOT NULL DEFAULT 15,
    "enableBlocking" BOOLEAN NOT NULL DEFAULT false,
    "blockBeforeTime" TEXT NOT NULL DEFAULT '06:00',
    "blockAfterTime" TEXT NOT NULL DEFAULT '12:00'
);
INSERT INTO "new_Office" ("id", "latitude", "longitude", "name", "radius") SELECT "id", "latitude", "longitude", "name", "radius" FROM "Office";
DROP TABLE "Office";
ALTER TABLE "new_Office" RENAME TO "Office";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
