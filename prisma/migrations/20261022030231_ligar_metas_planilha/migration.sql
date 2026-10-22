-- AlterTable
ALTER TABLE "lancamentos" ADD COLUMN     "meta_id" TEXT;

-- CreateTable
CREATE TABLE "orcamento_metas" (
    "id" TEXT NOT NULL,
    "orcamento_id" TEXT NOT NULL,
    "meta_id" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "orcamento_metas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orcamento_metas_orcamento_id_meta_id_key" ON "orcamento_metas"("orcamento_id", "meta_id");

-- CreateIndex
CREATE INDEX "lancamentos_meta_id_idx" ON "lancamentos"("meta_id");

-- AddForeignKey
ALTER TABLE "orcamento_metas" ADD CONSTRAINT "orcamento_metas_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "orcamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento_metas" ADD CONSTRAINT "orcamento_metas_meta_id_fkey" FOREIGN KEY ("meta_id") REFERENCES "metas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_meta_id_fkey" FOREIGN KEY ("meta_id") REFERENCES "metas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
