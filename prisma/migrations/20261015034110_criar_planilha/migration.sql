-- CreateTable
CREATE TABLE "orcamentos" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "mes" VARCHAR(7) NOT NULL,
    "renda" DECIMAL(12,2) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orcamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamento_categorias" (
    "id" TEXT NOT NULL,
    "orcamento_id" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "orcamento_categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "valor_total" DECIMAL(12,2) NOT NULL,
    "parcelas" INTEGER NOT NULL DEFAULT 1,
    "data" DATE NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lancamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orcamentos_usuario_id_mes_key" ON "orcamentos"("usuario_id", "mes");

-- CreateIndex
CREATE UNIQUE INDEX "orcamento_categorias_orcamento_id_categoria_key" ON "orcamento_categorias"("orcamento_id", "categoria");

-- CreateIndex
CREATE INDEX "lancamentos_usuario_id_data_idx" ON "lancamentos"("usuario_id", "data");

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento_categorias" ADD CONSTRAINT "orcamento_categorias_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "orcamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
