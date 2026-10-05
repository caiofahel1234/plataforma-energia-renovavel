import { useState } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts'
import { FileDown, FileText, History } from 'lucide-react'
import { useTOPSIS } from '../hooks/useTOPSIS'
import ResultadoTabela from '../components/topsis/ResultadoTabela'
import { Card, Btn, inputCls } from '../components/common/ui'
import { exportCSV, exportPDF } from '../utils/exportData'
import { fmtDate } from '../utils/formatters'

export default function Resultados() {
  const { ranking, criteria, history, reopen, notify } = useTOPSIS()
  const [selId, setSelId] = useState(null)
  const sel = ranking.find(r => r.id === selId) ?? ranking[0]
  const radar = criteria.map((c, j) => ({ crit: `C${j + 1}`, [sel.nome]: +sel.scores[j].toFixed(3), Ideal: 1 }))
  return (<>
    <Card title="Ranking completo">
      <div className="flex gap-2 mb-3">
        <Btn variant="ghost" onClick={() => { exportCSV(ranking); notify('CSV exportado') }}><FileDown size={14} className="inline mr-1" />CSV</Btn>
        <Btn variant="ghost" onClick={() => exportPDF(ranking)}><FileText size={14} className="inline mr-1" />PDF</Btn>
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
            <div><b>{fmtDate(h.date)}</b> · {h.source}<br />Pesos: {h.criteria.map(c => c.weight).join('/')}<br />Menos vulnerável: {h.ranking[0].nome}</div>
            <Btn variant="ghost" onClick={() => reopen(h)}><History size={12} className="inline" /> Reabrir</Btn>
          </li>))}</ul>
      </Card>
    </div></>)
}
