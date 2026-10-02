-- CreateTable
CREATE TABLE "matriz_decisao" (
    "id" SERIAL NOT NULL,
    "municipio_id" INTEGER NOT NULL,
    "criterio_id" INTEGER NOT NULL,
    "valor" DECIMAL(15,4) NOT NULL,
    "ano_referencia" INTEGER,

    CONSTRAINT "matriz_decisao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "matriz_decisao_municipio_id_criterio_id_ano_referencia_key" ON "matriz_decisao"("municipio_id", "criterio_id", "ano_referencia");

-- AddForeignKey
ALTER TABLE "matriz_decisao" ADD CONSTRAINT "matriz_decisao_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriz_decisao" ADD CONSTRAINT "matriz_decisao_criterio_id_fkey" FOREIGN KEY ("criterio_id") REFERENCES "criterios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
