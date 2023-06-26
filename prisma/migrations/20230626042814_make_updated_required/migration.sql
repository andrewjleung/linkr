/*
  Warnings:

  - Made the column `updatedAt` on table `Collection` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Link` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Tag` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Link" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "updatedAt" SET NOT NULL;
