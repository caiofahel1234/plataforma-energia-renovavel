-- Schema do Cap. 6 + usuarios e audit_logs. (CASCADE adicionado nas FKs para permitir exclusões)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY, nome VARCHAR(120) NOT NULL, email VARCHAR(254) NOT NULL UNIQUE,
  papel VARCHAR(20) NOT NULL CHECK (papel IN ('admin','pesquisador','gestor')),
  senha_hash VARCHAR(100) NOT NULL,               -- bcrypt
  ativo BOOLEAN NOT NULL DEFAULT TRUE, tentativas_falhas INTEGER NOT NULL DEFAULT 0, bloqueado_ate TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE municipios (
  id SERIAL PRIMARY KEY, nome VARCHAR(200) NOT NULL, uf CHAR(2) NOT NULL, populacao INTEGER, idh DECIMAL(4,3),
  coordenadas GEOMETRY(Point, 4326), created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE criterios (
  id SERIAL PRIMARY KEY, nome VARCHAR(150) NOT NULL, descricao TEXT,
  tipo VARCHAR(10) CHECK (tipo IN ('beneficio','custo')), peso DECIMAL(5,4) DEFAULT 0.0, unidade VARCHAR(50));
CREATE TABLE matriz_decisao (
  id SERIAL PRIMARY KEY, municipio_id INTEGER REFERENCES municipios(id) ON DELETE CASCADE,
  criterio_id INTEGER REFERENCES criterios(id) ON DELETE CASCADE, valor DECIMAL(15,4) NOT NULL, ano_referencia INTEGER,
  UNIQUE(municipio_id, criterio_id, ano_referencia));
CREATE TABLE simulacoes (
  id SERIAL PRIMARY KEY, usuario_id INTEGER REFERENCES usuarios(id), data_execucao TIMESTAMP DEFAULT NOW(),
  parametros JSONB, status VARCHAR(20) DEFAULT 'concluida');
CREATE TABLE resultados_ranking (
  id SERIAL PRIMARY KEY, simulacao_id INTEGER REFERENCES simulacoes(id) ON DELETE CASCADE,
  municipio_id INTEGER REFERENCES municipios(id) ON DELETE CASCADE, coeficiente_ci DECIMAL(10,8),
  distancia_positiva DECIMAL(10,8), distancia_negativa DECIMAL(10,8), posicao INTEGER);
CREATE TABLE audit_logs (   -- somente INSERT pela aplicação; sem dados sensíveis
  id BIGSERIAL PRIMARY KEY, ts TIMESTAMP NOT NULL DEFAULT NOW(), usuario_id INTEGER, acao VARCHAR(60) NOT NULL,
  entidade VARCHAR(60), entidade_id VARCHAR(40), ip VARCHAR(64), detalhes JSONB);
CREATE INDEX ON matriz_decisao(municipio_id); CREATE INDEX ON resultados_ranking(simulacao_id); CREATE INDEX ON audit_logs(ts);
-- Critérios do Cap. 7.1 (pesos somam 1,0)
INSERT INTO criterios(nome,tipo,peso,unidade) VALUES
 ('% domicílios sem acesso à eletricidade','custo',0.20,'%'),
 ('Capacidade instalada solar','beneficio',0.15,'kW/hab'),
 ('Renda per capita','beneficio',0.15,'R$'),
 ('Tarifa média de energia','custo',0.15,'R$/kWh'),
 ('Índice de irradiação solar','beneficio',0.15,'kWh/m²/dia'),
 ('% população em extrema pobreza','custo',0.10,'%'),
 ('Nº de projetos de energia renovável ativos','beneficio',0.10,'un');
