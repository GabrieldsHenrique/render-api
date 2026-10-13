/*
  Warnings:

  - You are about to drop the column `cpf` on the `usuarios` table. All the data in the column will be lost.
  - Added the required column `termos_aceitos_em` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "usuarios_cpf_key";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "cpf",
ADD COLUMN     "termos_aceitos_em" TIMESTAMP(3) NOT NULL;
