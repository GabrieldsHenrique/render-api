-- CreateTable
CREATE TABLE "fases_concluidas" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "fase" INTEGER NOT NULL,
    "xp_ganho" INTEGER NOT NULL,
    "concluida_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fases_concluidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas_quiz" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "fase" INTEGER NOT NULL,
    "card_id" TEXT NOT NULL,
    "acertou" BOOLEAN NOT NULL,
    "respondida_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "respostas_quiz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fases_concluidas_usuario_id_fase_key" ON "fases_concluidas"("usuario_id", "fase");

-- CreateIndex
CREATE UNIQUE INDEX "respostas_quiz_usuario_id_fase_card_id_key" ON "respostas_quiz"("usuario_id", "fase", "card_id");

-- AddForeignKey
ALTER TABLE "fases_concluidas" ADD CONSTRAINT "fases_concluidas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_quiz" ADD CONSTRAINT "respostas_quiz_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
