'use strict';
const PDFDocument = require('pdfkit');
const { csvCell } = require('../utils/csv');
const f = n => Number(n).toFixed(4);
exports.csv = ranking => '\ufeff' + [['Posição', 'Município', 'D+', 'D-', 'Ci'], ...ranking.map(r => [r.pos, r.nome, f(r.dPlus), f(r.dMinus), f(r.ci)])].map(l => l.map(csvCell).join(';')).join('\n');
exports.pdf = (res, s) => {
  const doc = new PDFDocument({ margin: 40 }); doc.pipe(res);
  doc.fontSize(16).text('Ranking de Vulnerabilidade Social Energética (TOPSIS)').moveDown(0.5);
  doc.fontSize(9).text(`Simulação #${s.id} · ${new Date(s.data).toLocaleString('pt-BR')} · maior Ci = menos vulnerável`).moveDown();
  s.ranking.forEach(r => doc.fontSize(10).text(`${r.pos}º  ${r.nome}/${r.uf}   D+ ${f(r.dPlus)}   D- ${f(r.dMinus)}   Ci ${f(r.ci)}`));
  doc.end();
};
