-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RideSource" AS ENUM ('MANUAL_PASTE', 'MANUAL_ENTRY', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "reminderLeadMinutes" INTEGER NOT NULL DEFAULT 120,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "pickupDateTime" TIMESTAMP(3) NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "dropoffLocation" TEXT,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT,
    "price" DOUBLE PRECISION,
    "notes" TEXT,
    "passengerCount" INTEGER,
    "flightNumber" TEXT,
    "status" "RideStatus" NOT NULL DEFAULT 'CONFIRMED',
    "source" "RideSource" NOT NULL DEFAULT 'MANUAL_PASTE',
    "rawText" TEXT NOT NULL,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Ride_ownerId_pickupDateTime_idx" ON "Ride"("ownerId", "pickupDateTime");

-- CreateIndex
CREATE INDEX "Ride_reminderSent_pickupDateTime_idx" ON "Ride"("reminderSent", "pickupDateTime");

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

