-- CreateTable
CREATE TABLE "criterios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "descricao" TEXT,
    "tipo" VARCHAR(10) NOT NULL,
    "peso" DECIMAL(5,4),
    "unidade" VARCHAR(50),

    CONSTRAINT "criterios_pkey" PRIMARY KEY ("id")
);
