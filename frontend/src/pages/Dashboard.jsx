import { Building2, Gauge, AlertTriangle, Sun } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTOPSIS } from '../hooks/useTOPSIS'
import KpiCard from '../components/dashboard/KpiCard'
import MapaView from '../components/map/MapaView'
import { Card } from '../components/common/ui'
import { fmt, fmtInt, faixa } from '../utils/formatters'

export default function Dashboard() {
  const { ranking, munis, criteria } = useTOPSIS()
  const media = ranking.reduce((s, r) => s + r.ci, 0) / ranking.length
  const pior = ranking[ranking.length - 1]
  const cap = munis.reduce((s, m) => s + m.values.c2, 0)
  return (<>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <KpiCard icon={Building2} label="Municípios cadastrados" value={munis.length} />
      <KpiCard icon={Gauge} label="Média de Cᵢ" value={fmt(media)} />
      <KpiCard icon={AlertTriangle} label="Mais vulnerável" value={pior.nome} />
      <KpiCard icon={Sun} label="Capacidade instalada" value={`${fmtInt(cap)} kWp`} />
    </div>
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title="Ranking de Vulnerabilidade (Cᵢ)">
        <div className="h-72"><ResponsiveContainer>
          <BarChart data={ranking} layout="vertical" margin={{ left: 40 }}>
            <XAxis type="number" domain={[0, 1]} /><YAxis type="category" dataKey="nome" width={110} />
            <Tooltip formatter={v => fmt(v)} />
            <Bar dataKey="ci" name="Cᵢ">{ranking.map(r => <Cell key={r.id} fill={faixa(r.ci).cor} />)}</Bar>
          </BarChart></ResponsiveContainer></div>
      </Card>
      <Card title="Distribuição geográfica"><MapaView ranking={ranking} criteria={criteria} /></Card>
    </div></>)
}
