import { useState, useMemo } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from 'recharts'
import { useTOPSIS } from '../hooks/useTOPSIS'
import CorrTable from '../components/topsis/CorrTable'
import { Card } from '../components/common/ui'
import { matrizCorrelacao, corrComCi } from '../utils/stats'
import { fmt } from '../utils/formatters'
const CORES = ['#dc2626', '#0f766e', '#2563eb']

// Pesquisador: "analisar correlações entre indicadores" (Cap. 3) e "análise comparativa entre unidades" (Cap. 1)
export default function Analise() {
  const { munis, criteria, ranking } = useTOPSIS()
  const [sel, setSel] = useState([])
  const ok = munis.length >= 3 && criteria.length >= 2 && ranking.length >= 3
  const M = useMemo(() => ok ? matrizCorrelacao(munis, criteria) : null, [ok, munis, criteria])
  const cci = useMemo(() => ok ? corrComCi(ranking, criteria) : [], [ok, ranking, criteria])
  if (!ok) return <Card title="Análise de indicadores"><p className="text-sm text-slate-500">São necessários ao menos 3 municípios e 2 critérios.</p></Card>
  const ids = sel.length ? sel : [ranking[0].id, ranking[ranking.length - 1].id]
  const esc = ranking.filter(r => ids.includes(r.id))
  const toggle = id => setSel(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id].slice(-3))
  const radar = criteria.map((c, j) => ({ crit: `C${j + 1}`, ...Object.fromEntries(esc.map(r => [r.nome, +(r.scores[j] ?? 0).toFixed(3)])) }))
  const dados = criteria.map((c, i) => ({ nome: `C${i + 1}`, r: +cci[i].toFixed(2) }))
  return (<>
    <Card title="Matriz de correlação de Pearson entre indicadores">
      <CorrTable M={M} criteria={criteria} />
      <p className="text-xs text-slate-500 mt-2">Verde: positiva · vermelho: negativa. Passe o mouse sobre a célula para ver o par de indicadores.</p>
    </Card>
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title="Correlação de cada indicador com o Ci">
        <div className="h-64"><ResponsiveContainer><BarChart data={dados} layout="vertical"><XAxis type="number" domain={[-1, 1]} /><YAxis type="category" dataKey="nome" width={40} />
          <Tooltip formatter={v => v.toFixed(2)} /><ReferenceLine x={0} stroke="#64748b" /><Bar dataKey="r">{dados.map((d, i) => <Cell key={i} fill={d.r >= 0 ? '#059669' : '#dc2626'} />)}</Bar></BarChart></ResponsiveContainer></div>
      </Card>
      <Card title="Comparação entre unidades de análise (até 3)">
        <div className="flex flex-wrap gap-2 mb-2">{ranking.map(r => <label key={r.id} className={`text-xs border rounded-full px-3 py-1 cursor-pointer ${ids.includes(r.id) ? 'bg-sky-100 border-sky-400' : 'bg-white'}`}>
          <input type="checkbox" className="hidden" checked={ids.includes(r.id)} onChange={() => toggle(r.id)} />{r.nome}</label>)}</div>
        <div className="h-64"><ResponsiveContainer><RadarChart data={radar}><PolarGrid /><PolarAngleAxis dataKey="crit" /><PolarRadiusAxis domain={[0, 1]} />
          {esc.map((r, k) => <Radar key={r.id} dataKey={r.nome} stroke={CORES[k]} fill={CORES[k]} fillOpacity={0.2} />)}<Legend /></RadarChart></ResponsiveContainer></div>
      </Card>
    </div>
    <Card title="Valores por indicador (unidades comparadas)">
      <div className="overflow-x-auto"><table className="text-sm w-full"><thead><tr className="text-left text-slate-500 border-b"><th className="py-1">Município</th><th>Ci</th>{criteria.map((c, i) => <th key={c.id} title={c.nome}>C{i + 1}</th>)}</tr></thead>
        <tbody>{esc.map(r => <tr key={r.id} className="border-b last:border-0"><td className="py-1 font-medium">{r.nome}</td><td className="font-mono">{fmt(r.ci)}</td>{criteria.map(c => <td key={c.id} className="font-mono">{r.values[c.id]}</td>)}</tr>)}</tbody></table></div>
    </Card>
  </>)
}
