import { corCorr } from '../../utils/stats'
// Matriz de correlação de Pearson entre critérios (mapa de calor em tabela)
export default function CorrTable({ M, criteria }) {
  return (
    <div className="overflow-x-auto"><table className="text-xs border-separate border-spacing-1">
      <thead><tr><th />{criteria.map((c, i) => <th key={c.id} title={c.nome} className="font-semibold text-slate-600 px-1">C{i + 1}</th>)}</tr></thead>
      <tbody>{M.map((row, i) => <tr key={i}><th title={criteria[i].nome} className="font-semibold text-slate-600 pr-1 text-right">C{i + 1}</th>
        {row.map((r, j) => <td key={j} className="w-12 h-8 text-center rounded font-mono" style={{ background: corCorr(r) }} title={`${criteria[i].nome} × ${criteria[j].nome}`}>{r.toFixed(2)}</td>)}</tr>)}</tbody>
    </table></div>)
}
