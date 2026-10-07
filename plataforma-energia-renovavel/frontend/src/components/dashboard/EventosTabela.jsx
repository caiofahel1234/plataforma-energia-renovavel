import { fmtDate } from '../../utils/formatters'
const COR = a => /FALHA|NEGADO|CSRF/.test(a) ? 'text-red-700 bg-red-50' : /EXCLU/.test(a) ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50'
// Trilha de auditoria (dados já saneados no servidor); React escapa toda saída
export default function EventosTabela({ eventos }) {
  if (!eventos.length) return <p className="text-sm text-slate-500">Nenhum evento registrado.</p>
  return <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="text-left text-slate-500 border-b"><th className="py-1 pr-2">Quando</th><th className="pr-2">Ação</th><th className="pr-2">Usuário</th><th className="pr-2">Entidade</th><th>IP</th></tr></thead>
    <tbody>{eventos.map(e => <tr key={e.id} className="border-b last:border-0"><td className="py-1 pr-2 whitespace-nowrap">{fmtDate(e.ts)}</td><td className="pr-2"><span className={`px-1.5 py-0.5 rounded font-mono ${COR(e.acao)}`}>{e.acao}</span></td>
      <td className="pr-2">{e.usuario_id ?? '—'}</td><td className="pr-2">{e.entidade ? `${e.entidade} #${e.entidade_id ?? ''}` : '—'}</td><td>{e.ip}</td></tr>)}</tbody></table></div>
}
