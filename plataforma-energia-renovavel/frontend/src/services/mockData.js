// Critérios do Cap. 7.1. O "ideal" é sempre MENOR vulnerabilidade -> Ci alto = menos vulnerável.
export const CRITERIOS = [
  { id: 'c1', nome: '% domicílios sem acesso à eletricidade', type: 'cost', unit: '%', weight: 20 },
  { id: 'c2', nome: 'Capacidade instalada solar', type: 'benefit', unit: 'kW/hab', weight: 15 },
  { id: 'c3', nome: 'Renda per capita', type: 'benefit', unit: 'R$', weight: 15 },
  { id: 'c4', nome: 'Tarifa média de energia', type: 'cost', unit: 'R$/kWh', weight: 15 },
  { id: 'c5', nome: 'Índice de irradiação solar', type: 'benefit', unit: 'kWh/m²/dia', weight: 15 },
  { id: 'c6', nome: '% população em extrema pobreza', type: 'cost', unit: '%', weight: 10 },
  { id: 'c7', nome: 'Nº de projetos de energia renovável ativos', type: 'benefit', unit: 'un', weight: 10 },
]
// Dados FICTÍCIOS (modo demonstração)
const m = (id, nome, populacao, idh, lat, lng, v) => ({ id, nome, uf: 'BA', populacao, idh, lat, lng, values: Object.fromEntries(v.map((x, i) => ['c' + (i + 1), x])) })
export const MUNICIPIOS = [
  m(1, 'Salvador', 2418000, 0.759, -12.97, -38.50, [0.4, 0.0021, 1850, 0.92, 5.4, 5.1, 42]),
  m(2, 'Juazeiro', 237000, 0.667, -9.41, -40.50, [2.1, 0.016, 1000, 0.88, 6.1, 11.5, 18]),
  m(3, 'Barreiras', 160000, 0.721, -12.15, -44.99, [1.8, 0.038, 1500, 0.86, 5.9, 7.2, 25]),
  m(4, 'Ruy Barbosa', 31000, 0.589, -12.28, -40.49, [6.5, 0.003, 620, 0.97, 5.8, 21, 2]),
  m(5, 'Canudos', 17000, 0.536, -9.90, -39.00, [9.8, 0.002, 480, 0.99, 6.2, 28, 1]),
  m(6, 'Lençóis', 11000, 0.639, -12.56, -41.39, [3.2, 0.009, 800, 0.90, 5.7, 14.5, 4]),
  m(7, 'Feira de Santana', 616000, 0.712, -12.27, -38.97, [0.9, 0.0045, 1300, 0.91, 5.5, 8.4, 20]),
  m(8, 'Cotegipe', 13000, 0.552, -12.02, -44.26, [8.2, 0.0025, 540, 0.98, 6.0, 24, 1]),
]
