-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "kinds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[];
