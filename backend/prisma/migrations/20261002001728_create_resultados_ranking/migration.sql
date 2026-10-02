-- CreateTable
CREATE TABLE "resultados_ranking" (
    "id" SERIAL NOT NULL,
    "simulacao_id" INTEGER NOT NULL,
    "municipio_id" INTEGER NOT NULL,
    "coeficiente_ci" DECIMAL(10,8) NOT NULL,
    "distancia_positiva" DECIMAL(10,8) NOT NULL,
    "distancia_negativa" DECIMAL(10,8) NOT NULL,
    "posicao" INTEGER NOT NULL,

    CONSTRAINT "resultados_ranking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "resultados_ranking" ADD CONSTRAINT "resultados_ranking_simulacao_id_fkey" FOREIGN KEY ("simulacao_id") REFERENCES "simulacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_ranking" ADD CONSTRAINT "resultados_ranking_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
