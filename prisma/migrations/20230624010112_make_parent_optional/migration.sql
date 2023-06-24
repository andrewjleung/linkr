-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_parentId_fkey";

-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "parentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Link" ALTER COLUMN "parentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
