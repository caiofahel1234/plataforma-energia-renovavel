import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Lock } from 'lucide-react'
import { useTOPSIS } from '../hooks/useTOPSIS'
import { Card, Btn } from '../components/common/ui'

// UC03 (Gestor Público): selecionar dataset → executar → visualizar ranking. Pesos/tipos são OFICIAIS e somente leitura (UC02 é do Pesquisador).
export default function ExecutarTOPSIS() {
  const { criteria, munis, run } = useTOPSIS(); const nav = useNavigate()
  const [sel, setSel] = useState(null)
  const efetivo = sel ?? new Set(munis.map(m => m.id))
  const toggle = id => { const n = new Set(efetivo); n.has(id) ? n.delete(id) : n.add(id); setSel(n) }
  const soma = criteria.reduce((s, c) => s + Number(c.weight), 0)
  const valido = soma === 100 && efetivo.size >= 2
  const exec = async () => { if (await run({ municipioIds: efetivo.size === munis.length ? undefined : [...efetivo] })) nav('/resultados') }
  return (<>
    <Card title="1. Selecione o dataset (municípios)">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{munis.map(m => (
        <label key={m.id} className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 cursor-pointer hover:bg-emerald-50">
          <input type="checkbox" className="accent-emerald-600" checked={efetivo.has(m.id)} onChange={() => toggle(m.id)} />{m.nome}/{m.uf}</label>))}</div>
      <div className="mt-2 flex gap-3 text-xs text-slate-500"><span>{efetivo.size} de {munis.length} selecionados</span>
        <button className="underline" onClick={() => setSel(new Set(munis.map(m => m.id)))}>todos</button><button className="underline" onClick={() => setSel(new Set())}>nenhum</button></div>
    </Card>
    <Card title="2. Configuração oficial de critérios e pesos">
      <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Lock size={12} />Definida pelo Pesquisador (UC02). Somente leitura: o servidor usa sempre esta configuração.</p>
      <table className="w-full text-sm"><thead><tr className="text-left text-slate-500 border-b"><th className="py-1">Critério</th><th>Tipo</th><th className="text-right">Peso</th></tr></thead>
        <tbody>{criteria.map((c, i) => <tr key={c.id} className="border-b last:border-0"><td className="py-1"><b>C{i + 1}</b> {c.nome}</td>
          <td><span className={`px-2 py-0.5 rounded text-xs ${c.type === 'benefit' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{c.type === 'benefit' ? 'Benefício' : 'Custo'}</span></td><td className="text-right font-mono">{c.weight}%</td></tr>)}</tbody></table>
      {soma !== 100 && <p role="alert" className="mt-3 text-sm text-red-700 bg-red-50 rounded p-2">A configuração oficial soma {soma}% (deve ser 100%). Solicite ao Pesquisador que a corrija.</p>}
    </Card>
    <div className="flex items-center gap-3"><Btn disabled={!valido} onClick={exec}><Play size={14} className="inline mr-1" />Executar TOPSIS</Btn>
      {efetivo.size < 2 && <span className="text-sm text-slate-500">Selecione ao menos 2 municípios.</span>}</div>
  </>)
}
