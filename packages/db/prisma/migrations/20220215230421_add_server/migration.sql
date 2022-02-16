-- CreateEnum
CREATE TYPE "Server" AS ENUM ('EU', 'US', 'AS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "server" "Server" NOT NULL DEFAULT E'EU';
