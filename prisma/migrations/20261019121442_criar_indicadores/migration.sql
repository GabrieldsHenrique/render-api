-- CreateTable
CREATE TABLE "indicadores" (
    "codigo" TEXT NOT NULL,
    "valor" DECIMAL(7,4) NOT NULL,
    "referencia" DATE NOT NULL,
    "buscado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indicadores_pkey" PRIMARY KEY ("codigo")
);
