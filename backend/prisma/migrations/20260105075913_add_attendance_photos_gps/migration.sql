-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "attendanceDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkIn" DATETIME,
    "checkOut" DATETIME,
    "checkInPhotoUrl" TEXT,
    "checkOutPhotoUrl" TEXT,
    "checkInLatitude" REAL,
    "checkInLongitude" REAL,
    "checkOutLatitude" REAL,
    "checkOutLongitude" REAL,
    CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "attendanceId" TEXT,
    "visitTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purpose" TEXT NOT NULL,
    "notes" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "photoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "Visit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Visit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Visit_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "approvedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Approval_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
