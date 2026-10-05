import { fmt } from './formatters'
const head = ['Posição', 'Município', 'D+', 'D-', 'Ci']
const lines = rows => rows.map(r => [r.pos, r.nome, fmt(r.dPlus), fmt(r.dMinus), fmt(r.ci)])
export function exportCSV(rows) {
  const csv = [head, ...lines(rows)].map(l => l.join(';')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
  a.download = 'ranking_topsis.csv'; a.click(); URL.revokeObjectURL(a.href)
}
// PDF simulado via impressão do navegador ("Salvar como PDF")
export function exportPDF(rows) {
  const w = window.open('', '_blank')
  w.document.write(`<html><head><title>Ranking TOPSIS</title><style>body{font-family:sans-serif}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:6px;text-align:left}</style></head><body><h2>Ranking de Vulnerabilidade Social Energética</h2><table><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${lines(rows).map(l => `<tr>${l.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></body></html>`)
  w.document.close(); w.print()
}
