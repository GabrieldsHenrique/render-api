-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('ALUNO', 'ADMIN');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "papel" "Papel" NOT NULL DEFAULT 'ALUNO';
