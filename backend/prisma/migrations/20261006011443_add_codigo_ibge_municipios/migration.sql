/*
  Warnings:

  - A unique constraint covering the columns `[codigo_ibge]` on the table `municipios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "municipios" ADD COLUMN     "codigo_ibge" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "municipios_codigo_ibge_key" ON "municipios"("codigo_ibge");
