import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Plus, Trash2 } from 'lucide-react'
import { useTOPSIS } from '../hooks/useTOPSIS'
import { useAuth, PERM } from '../hooks/useAuth'
import { API_ON } from '../services/api'
import { limpa } from '../utils/sanitize'
import { Card, Btn, inputCls } from '../components/common/ui'

export default function ConfiguracaoTOPSIS() {
  const { criteria, setCriteria, munis, persistMunis, run, addCriterio, removeCriterio, notify, salvarConfig } = useTOPSIS()
  const { user } = useAuth(); const nav = useNavigate()
  const canCrit = PERM.criterios.includes(user.papel) // UC02 / RF02
  const [novo, setNovo] = useState({ nome: '', type: 'benefit', unit: '' })
  const soma = criteria.reduce((s, c) => s + Number(c.weight), 0); const ok = soma === 100 && criteria.length >= 2
  const upd = (i, patch) => setCriteria(criteria.map((c, j) => j === i ? { ...c, ...patch } : c))
  const editVal = (mi, cid, v) => { const n = Number(v); if (Number.isFinite(n)) persistMunis(munis.map((m, i) => i === mi ? { ...m, values: { ...m.values, [cid]: n } } : m)) }
  const exec = async () => { if (await run()) nav('/resultados') }
  const add = async () => {
    const nome = limpa(novo.nome); if (nome.length < 2) return notify('Informe o nome do critério', 'err')
    if (await addCriterio({ nome, type: novo.type, unit: limpa(novo.unit) })) setNovo({ nome: '', type: 'benefit', unit: '' })
  }
  return (<>
    <Card title="Critérios, tipos e pesos">
      <div className="space-y-3">
        {criteria.map((c, i) => (
          <div key={c.id} className="grid md:grid-cols-[1fr_130px_2fr_50px_32px] gap-2 items-center text-sm">
            <span><b>C{i + 1}</b> {c.nome} <span className="text-slate-400">({c.unit})</span></span>
            <select className={inputCls} value={c.type} onChange={e => upd(i, { type: e.target.value })}><option value="benefit">Benefício</option><option value="cost">Custo</option></select>
            <input type="range" min="0" max="100" value={c.weight} onChange={e => upd(i, { weight: Number(e.target.value) })} className="accent-emerald-600" />
            <span className="text-right font-mono">{c.weight}%</span>
            {canCrit && <button title="Excluir critério" onClick={() => window.confirm(`Excluir "${c.nome}"?`) && removeCriterio(c.id)}><Trash2 size={14} className="text-red-500" /></button>}
          </div>))}
      </div>
      {canCrit && <div className="mt-4 grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-2">
        <input className={inputCls} placeholder="Novo critério" maxLength={120} value={novo.nome} onChange={e => setNovo({ ...novo, nome: e.target.value })} />
        <select className={inputCls} value={novo.type} onChange={e => setNovo({ ...novo, type: e.target.value })}><option value="benefit">Benefício</option><option value="cost">Custo</option></select>
        <input className={inputCls} placeholder="Unidade" maxLength={50} value={novo.unit} onChange={e => setNovo({ ...novo, unit: e.target.value })} />
        <Btn variant="ghost" onClick={add}><Plus size={14} className="inline" /> Adicionar</Btn></div>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>Soma dos pesos: {soma}% {soma === 100 ? '✓' : '(deve ser 100%)'}</div>
        <Btn disabled={!ok} onClick={salvarConfig} title="O Gestor Público executa sempre com a configuração oficial">Salvar como configuração oficial</Btn>
        <Btn variant="ghost" disabled={!ok} onClick={exec}><Play size={14} className="inline mr-1" />Executar TOPSIS</Btn>
      </div>
    </Card>
    <Card title={`Matriz de decisão ${API_ON ? '(somente leitura)' : '(editável)'}`}>
      <div className="overflow-x-auto"><table className="text-sm w-full">
        <thead><tr className="text-left text-slate-500"><th className="pr-3">Município</th>{criteria.map((c, i) => <th key={c.id} title={c.nome} className="px-1">C{i + 1}</th>)}</tr></thead>
        <tbody>{munis.map((m, mi) => <tr key={m.id} className="border-t"><td className="pr-3 py-1 whitespace-nowrap">{m.nome}</td>
          {criteria.map(c => <td key={c.id} className="px-1">{API_ON ? m.values[c.id] : <input type="number" step="any" className="w-24 border rounded px-1 py-1" value={m.values[c.id] ?? 0} onChange={e => editVal(mi, c.id, e.target.value)} />}</td>)}</tr>)}</tbody></table></div>
    </Card></>)
}
