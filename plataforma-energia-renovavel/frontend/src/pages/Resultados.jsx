import { useState } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts'
import { FileDown, FileText, History } from 'lucide-react'
import { useTOPSIS } from '../hooks/useTOPSIS'
import ResultadoTabela from '../components/topsis/ResultadoTabela'
import { Card, Btn, inputCls } from '../components/common/ui'
import { exportCSV, exportPDF } from '../utils/exportData'
import { baixar, erroGenerico } from '../services/api'
import { fmtDate, fmt, faixa } from '../utils/formatters'
import { useAuth } from '../hooks/useAuth'

export default function Resultados() {
  const { ranking, result, criteria, history, reopen, notify } = useTOPSIS(); const { user } = useAuth(); const gestor = user.papel === 'gestor'
  const [selId, setSelId] = useState(null)
  // Com API: relatório gerado e auditado no servidor (GET /api/relatorios/:id/pdf|csv)
  const servidor = async fmt => { try { await baixar(`/relatorios/${result.simulacaoId}/${fmt}`, `relatorio-${result.simulacaoId}.${fmt}`); notify('Relatório exportado') } catch (e) { notify(erroGenerico(e), 'err') } }
  const sel = ranking.find(r => r.id === selId) ?? ranking[0]
  if (!sel) return <Card title="Resultados"><p className="text-sm text-slate-500">Sem dados suficientes (mínimo 2 municípios e 2 critérios).</p></Card>
  const radar = criteria.map((c, j) => ({ crit: `C${j + 1}`, [sel.nome]: +(sel.scores[j] ?? 0).toFixed(3), Ideal: 1 }))
  const faixas = [['alta vulnerabilidade', ranking.filter(r => r.ci < 0.4).length, 'bg-red-50 text-red-800 border-red-200'], ['média', ranking.filter(r => r.ci >= 0.4 && r.ci < 0.6).length, 'bg-yellow-50 text-yellow-800 border-yellow-200'], ['baixa', ranking.filter(r => r.ci >= 0.6).length, 'bg-green-50 text-green-800 border-green-200']]
  return (<>
    {gestor ? <Card title="Resumo executivo – subsídio a políticas públicas (UC04)">
      <div className="grid grid-cols-3 gap-3 text-center text-sm mb-3">{faixas.map(([l, n, c]) => <div key={l} className={`rounded-xl p-3 border ${c}`}><b className="text-2xl block">{n}</b>{l}</div>)}</div>
      <p className="text-sm font-semibold mb-1">Prioridades de ação</p>
      <ol className="text-sm space-y-1 list-decimal ml-5">{[...ranking].reverse().slice(0, 5).map(r => <li key={r.id}><b>{r.nome}/{r.uf}</b> · Ci <span style={{ color: faixa(r.ci).cor }}>{fmt(r.ci)}</span> · indicador crítico: {r.critico}</li>)}</ol>
      <p className="text-xs text-slate-500 mt-2">Exporte o ranking completo em PDF ou CSV no cartão abaixo.</p></Card>
    : <Card title="Parâmetros aplicados à simulação">
      <div className="overflow-x-auto"><table className="text-sm w-full"><thead><tr className="text-left text-slate-500 border-b"><th className="py-1">Critério</th><th>Tipo</th><th className="text-right">Peso</th></tr></thead>
        <tbody>{criteria.map((c, i) => <tr key={c.id} className="border-b last:border-0"><td className="py-1"><b>C{i + 1}</b> {c.nome}</td><td>{c.type === 'benefit' ? 'Benefício' : 'Custo'}</td><td className="text-right font-mono">{c.weight}%</td></tr>)}</tbody></table></div>
      {result?.simulacaoId && <p className="text-xs text-slate-500 mt-2">Simulação #{result.simulacaoId}</p>}</Card>}
    <Card title="Ranking completo">
      <div className="flex gap-2 mb-3">
        <Btn variant="ghost" onClick={() => result?.simulacaoId ? servidor('csv') : (exportCSV(ranking), notify('CSV exportado'))}><FileDown size={14} className="inline mr-1" />CSV</Btn>
        <Btn variant="ghost" onClick={() => result?.simulacaoId ? servidor('pdf') : exportPDF(ranking)}><FileText size={14} className="inline mr-1" />PDF</Btn>
      </div>
      <ResultadoTabela ranking={ranking} onSelect={r => setSelId(r.id)} />
    </Card>
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title="Radar: município × solução ideal">
        <select className={inputCls + ' mb-2'} value={sel.id} onChange={e => setSelId(Number(e.target.value))}>
          {ranking.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}</select>
        <div className="h-72"><ResponsiveContainer><RadarChart data={radar}>
          <PolarGrid /><PolarAngleAxis dataKey="crit" /><PolarRadiusAxis domain={[0, 1]} />
          <Radar dataKey="Ideal" stroke="#0f766e" fill="#0f766e" fillOpacity={0.15} />
          <Radar dataKey={sel.nome} stroke="#dc2626" fill="#dc2626" fillOpacity={0.35} /><Legend />
        </RadarChart></ResponsiveContainer></div>
      </Card>
      <Card title="Histórico de simulações">
        {history.length === 0 && <p className="text-sm text-slate-500">Nenhuma simulação executada ainda.</p>}
        <ul className="space-y-2 max-h-80 overflow-auto">{history.map(h => (
          <li key={h.id} className="border rounded-lg p-2 text-xs flex justify-between gap-2">
            <div><b>{fmtDate(h.date)}</b> · {h.source}<br />Pesos: {h.pesos.join('/')}<br />Menos vulnerável: {h.top}</div>
            <Btn variant="ghost" onClick={() => reopen(h)}><History size={12} className="inline" /> Reabrir</Btn>
          </li>))}</ul>
      </Card>
    </div></>)
}
