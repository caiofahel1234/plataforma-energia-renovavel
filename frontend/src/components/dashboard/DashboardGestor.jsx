import { Link } from 'react-router-dom'
import { Building2, Gauge, AlertTriangle, Sun, Play, FileText, Map as MapIcon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTOPSIS } from '../../hooks/useTOPSIS'
import KpiCard from './KpiCard'
import MapaView from '../map/MapaView'
import { Card } from '../common/ui'
import { fmt, fmtInt, faixa } from '../../utils/formatters'
const lnk = 'inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium'

// Gestor Público (usuário primário): identificar comunidades vulneráveis para políticas públicas
export default function DashboardGestor() {
  const { ranking, munis, criteria } = useTOPSIS()
  const media = ranking.length ? ranking.reduce((s, r) => s + r.ci, 0) / ranking.length : 0
  const pior = ranking[ranking.length - 1]
  const solar = criteria.find(c => /capacidade.*solar/i.test(c.nome))
  const cap = solar ? munis.reduce((s, m) => s + (m.values[solar.id] || 0) * m.populacao, 0) : null
  const alta = ranking.filter(r => r.ci < 0.4).length, med = ranking.filter(r => r.ci >= 0.4 && r.ci < 0.6).length, baixa = ranking.filter(r => r.ci >= 0.6).length
  const prioridades = [...ranking].reverse().slice(0, 5)
  return (<>
    <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="font-bold text-teal-900 text-lg">Painel de Gestão</h1><p className="text-sm text-teal-800">Identifique as comunidades mais vulneráveis e gere relatórios para subsidiar políticas públicas.</p></div>
      <div className="flex gap-2 flex-wrap"><Link to="/executar" className={`${lnk} bg-emerald-600 text-white`}><Play size={14} />Executar TOPSIS</Link>
        <Link to="/resultados" className={`${lnk} bg-white border border-teal-300 text-teal-900`}><FileText size={14} />Relatórios</Link>
        <Link to="/mapa" className={`${lnk} bg-white border border-teal-300 text-teal-900`}><MapIcon size={14} />Mapa</Link></div>
    </div>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <KpiCard icon={Building2} label="Municípios monitorados" value={munis.length} />
      <KpiCard icon={Gauge} label="Média de Ci" value={fmt(media)} />
      <KpiCard icon={AlertTriangle} label="Mais vulnerável" value={pior?.nome ?? '—'} />
      <KpiCard icon={Sun} label="Capacidade instalada" value={cap === null ? '—' : `${fmtInt(Math.round(cap))} kW`} />
    </div>
    <div className="grid grid-cols-3 gap-3 text-center text-sm">
      <div className="rounded-xl p-3 bg-red-50 text-red-800 border border-red-200"><b className="text-2xl block">{alta}</b>alta vulnerabilidade</div>
      <div className="rounded-xl p-3 bg-yellow-50 text-yellow-800 border border-yellow-200"><b className="text-2xl block">{med}</b>média</div>
      <div className="rounded-xl p-3 bg-green-50 text-green-800 border border-green-200"><b className="text-2xl block">{baixa}</b>baixa</div>
    </div>
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title="Prioridades de ação (mais vulneráveis)">
        <ol className="space-y-2">{prioridades.map(r => (
          <li key={r.id} className="flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm">
            <span><b>{r.nome}/{r.uf}</b><br /><span className="text-xs text-slate-500">Indicador crítico: {r.critico}</span></span>
            <span className="font-mono font-semibold" style={{ color: faixa(r.ci).cor }}>Ci {fmt(r.ci)}</span></li>))}</ol>
      </Card>
      <Card title="Ranking de Vulnerabilidade (Ci)">
        <div className="h-72"><ResponsiveContainer><BarChart data={ranking} layout="vertical" margin={{ left: 40 }}>
          <XAxis type="number" domain={[0, 1]} /><YAxis type="category" dataKey="nome" width={110} interval={0} tick={{ fontSize: 12 }} /><Tooltip formatter={v => fmt(v)} />
          <Bar dataKey="ci" name="Ci">{ranking.map(r => <Cell key={r.id} fill={faixa(r.ci).cor} />)}</Bar></BarChart></ResponsiveContainer></div>
      </Card>
    </div>
    <Card title="Distribuição geográfica"><MapaView ranking={ranking} criteria={criteria} /></Card>
  </>)
}
