import { fmt } from './formatters'
const head = ['Posição', 'Município', 'D+', 'D-', 'Ci']
const lines = rows => rows.map(r => [r.pos, r.nome, fmt(r.dPlus), fmt(r.dMinus), fmt(r.ci)])
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
// Neutraliza CSV/Formula Injection (=, +, -, @)
const cell = v => { let s = String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
export function exportCSV(rows) {
  const csv = [head, ...lines(rows)].map(l => l.map(cell).join(';')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
  a.download = 'ranking_topsis.csv'; a.click(); URL.revokeObjectURL(a.href)
}
// PDF via impressão do navegador; conteúdo escapado + CSP restritiva no documento gerado
export function exportPDF(rows) {
  const w = window.open('', '_blank'); if (!w) return
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>Ranking TOPSIS</title><style>body{font-family:sans-serif}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:6px;text-align:left}</style></head><body><h2>Ranking de Vulnerabilidade Social Energética</h2><table><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${lines(rows).map(l => `<tr>${l.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></body></html>`)
  w.document.close(); w.print()
}
