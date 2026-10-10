import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Layers, Scale, History, GitCompare, SlidersHorizontal, LineChart } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { useTOPSIS } from '../../hooks/useTOPSIS'
import KpiCard from './KpiCard'
import CorrTable from '../topsis/CorrTable'
import { Card } from '../common/ui'
import { matrizCorrelacao, corrComCi, parMaisForte } from '../../utils/stats'
const lnk = 'inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium'

// Pesquisador (usuário especialista): analisar correlações entre indicadores; configurar critérios (UC02)
export default function DashboardPesquisador() {
  const { ranking, munis, criteria, history } = useTOPSIS()
  const ok = munis.length >= 3 && criteria.length >= 2
  const M = useMemo(() => ok ? matrizCorrelacao(munis, criteria) : null, [ok, munis, criteria])
  const cci = useMemo(() => ranking.length >= 3 ? corrComCi(ranking, criteria) : [], [ranking, criteria])
  const par = M ? parMaisForte(M) : null
  const soma = criteria.reduce((s, c) => s + Number(c.weight), 0)
  const dados = criteria.map((c, i) => ({ nome: `C${i + 1}`, r: +(cci[i] ?? 0).toFixed(2) }))
  return (<>
    <div className="rounded-xl bg-sky-50 border border-sky-200 p-4 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="font-bold text-sky-900 text-lg">Painel de Pesquisa</h1><p className="text-sm text-sky-800">Configure critérios e pesos e analise as correlações entre os indicadores de vulnerabilidade.</p></div>
      <div className="flex gap-2 flex-wrap"><Link to="/configuracao" className={`${lnk} bg-sky-700 text-white`}><SlidersHorizontal size={14} />Configurar critérios</Link>
        <Link to="/analise" className={`${lnk} bg-white border border-sky-300 text-sky-900`}><LineChart size={14} />Análise completa</Link>
        <Link to="/resultados" className={`${lnk} bg-white border border-sky-300 text-sky-900`}><History size={14} />Histórico</Link></div>
    </div>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <KpiCard icon={Layers} label="Critérios cadastrados" value={criteria.length} />
      <KpiCard icon={Scale} label="Soma dos pesos" value={`${soma}%${soma === 100 ? ' ✓' : ''}`} />
      <KpiCard icon={History} label="Simulações no histórico" value={history.length} />
      <KpiCard icon={GitCompare} label="Correlação mais forte" value={par ? `C${par.i + 1}×C${par.j + 1} (r=${par.r.toFixed(2)})` : '—'} />
    </div>
    {!ok ? <Card title="Análise"><p className="text-sm text-slate-500">São necessários ao menos 3 municípios e 2 critérios.</p></Card> :
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Correlação de Pearson entre indicadores"><CorrTable M={M} criteria={criteria} />
          <p className="text-xs text-slate-500 mt-2">Verde: correlação positiva · vermelho: negativa · intensidade = |r|.</p></Card>
        <Card title="Correlação de cada indicador com o Ci">
          <div className="h-64"><ResponsiveContainer><BarChart data={dados} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" domain={[-1, 1]} /><YAxis type="category" dataKey="nome" width={40} /><Tooltip formatter={v => v.toFixed(2)} /><ReferenceLine x={0} stroke="#64748b" />
            <Bar dataKey="r" name="r">{dados.map((d, i) => <Cell key={i} fill={d.r >= 0 ? '#059669' : '#dc2626'} />)}</Bar></BarChart></ResponsiveContainer></div>
          <p className="text-xs text-slate-500">r positivo: quanto maior o indicador, maior o Ci (menos vulnerável).</p></Card>
      </div>}
  </>)
}
