-- CreateTable
CREATE TABLE "municipios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "populacao" INTEGER,
    "idh" DECIMAL(4,3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "municipios_pkey" PRIMARY KEY ("id")
);
