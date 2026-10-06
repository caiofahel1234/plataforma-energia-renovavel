CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE "municipios"
ADD COLUMN "coordenadas" geometry(Point, 4326);