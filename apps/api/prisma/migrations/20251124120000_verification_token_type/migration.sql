-- CreateEnum
CREATE TYPE "VerificationTokenType" AS ENUM ('RESET_PASSWORD', 'LOGIN');

-- AlterTable
ALTER TABLE "VerificationToken" ADD COLUMN "type" "VerificationTokenType" NOT NULL DEFAULT 'RESET_PASSWORD';
