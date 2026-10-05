// Critérios (Cap. 7). Orientação: o "ideal" é sempre MENOR vulnerabilidade -> Ci alto = baixa vulnerabilidade.
export const CRITERIOS = [
  { id: 'c1', nome: '% domicílios sem eletricidade', type: 'cost', unit: '%', weight: 20 },
  { id: 'c2', nome: 'Capacidade solar instalada', type: 'benefit', unit: 'kWp', weight: 15 },
  { id: 'c3', nome: 'Renda média domiciliar', type: 'benefit', unit: 'R$', weight: 15 },
  { id: 'c4', nome: 'Tarifa média de energia', type: 'cost', unit: 'R$/kWh', weight: 15 },
  { id: 'c5', nome: 'IDH municipal', type: 'benefit', unit: '', weight: 15 },
  { id: 'c6', nome: 'Comprometimento da renda com energia', type: 'cost', unit: '%', weight: 10 },
  { id: 'c7', nome: 'Cobertura da Tarifa Social', type: 'benefit', unit: '%', weight: 10 },
]
// Dados FICTÍCIOS para demonstração
const m = (id, nome, uf, populacao, lat, lng, v) => ({ id, nome, uf, populacao, lat, lng,
  values: Object.fromEntries(v.map((x, i) => ['c' + (i + 1), x])) })
export const MUNICIPIOS = [
  m(1, 'Salvador', 'BA', 2418000, -12.97, -38.50, [0.4, 5200, 3100, 0.92, 0.759, 6.5, 62]),
  m(2, 'Juazeiro', 'BA', 237000, -9.41, -40.50, [2.1, 3800, 1750, 0.88, 0.667, 11.2, 71]),
  m(3, 'Barreiras', 'BA', 160000, -12.15, -44.99, [1.8, 6100, 2300, 0.86, 0.721, 8.9, 58]),
  m(4, 'Ruy Barbosa', 'BA', 31000, -12.28, -40.49, [6.5, 300, 1050, 0.97, 0.589, 18.4, 83]),
  m(5, 'Canudos', 'BA', 17000, -9.90, -39.00, [9.8, 120, 780, 0.99, 0.536, 23.1, 90]),
  m(6, 'Lençóis', 'BA', 11000, -12.56, -41.39, [3.2, 450, 1400, 0.90, 0.639, 13.0, 74]),
  m(7, 'Feira de Santana', 'BA', 616000, -12.27, -38.97, [0.9, 2900, 2200, 0.91, 0.712, 9.1, 60]),
  m(8, 'Cotegipe', 'BA', 13000, -12.02, -44.26, [8.2, 180, 900, 0.98, 0.552, 20.5, 87]),
]
