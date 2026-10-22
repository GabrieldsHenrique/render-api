-- CreateTable
CREATE TABLE "metas" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "icone" TEXT NOT NULL,
    "ja_tem" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "valor" DECIMAL(12,2),
    "mes" VARCHAR(7),
    "renda_mensal" DECIMAL(12,2),
    "idade_aposentar" INTEGER,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "metas_usuario_id_idx" ON "metas"("usuario_id");

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
