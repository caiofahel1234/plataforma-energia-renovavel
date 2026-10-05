import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { useTOPSIS } from '../hooks/useTOPSIS'
import { Card, Btn, inputCls } from '../components/common/ui'

export default function ConfiguracaoTOPSIS() {
  const { criteria, setCriteria, munis, saveMunis, run } = useTOPSIS(); const nav = useNavigate()
  const soma = criteria.reduce((s, c) => s + Number(c.weight), 0); const ok = soma === 100
  const upd = (i, patch) => setCriteria(criteria.map((c, j) => j === i ? { ...c, ...patch } : c))
  const editVal = (mi, cid, v) => saveMunis(munis.map((m, i) => i === mi ? { ...m, values: { ...m.values, [cid]: Number(v) } } : m))
  const exec = async () => { if (await run()) nav('/resultados') }
  return (<>
    <Card title="Critérios, tipos e pesos">
      <div className="space-y-3">
        {criteria.map((c, i) => (
          <div key={c.id} className="grid md:grid-cols-[1fr_130px_2fr_50px] gap-2 items-center text-sm">
            <span><b>C{i + 1}</b> {c.nome}</span>
            <select className={inputCls} value={c.type} onChange={e => upd(i, { type: e.target.value })}>
              <option value="benefit">Benefício</option><option value="cost">Custo</option></select>
            <input type="range" min="0" max="100" value={c.weight} onChange={e => upd(i, { weight: Number(e.target.value) })} className="accent-emerald-600" />
            <span className="text-right font-mono">{c.weight}%</span>
          </div>))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          Soma dos pesos: {soma}% {ok ? '✓' : '(deve ser 100%)'}</div>
        <Btn disabled={!ok} onClick={exec}><Play size={14} className="inline mr-1" />Executar TOPSIS</Btn>
      </div>
    </Card>
    <Card title="Matriz de decisão (editável)">
      <div className="overflow-x-auto"><table className="text-sm w-full">
        <thead><tr className="text-left text-slate-500"><th className="pr-3">Município</th>{criteria.map((c, i) => <th key={c.id} title={c.nome} className="px-1">C{i + 1}</th>)}</tr></thead>
        <tbody>{munis.map((m, mi) => <tr key={m.id} className="border-t">
          <td className="pr-3 py-1 whitespace-nowrap">{m.nome}</td>
          {criteria.map(c => <td key={c.id} className="px-1"><input type="number" step="any" className="w-24 border rounded px-1 py-1" value={m.values[c.id]} onChange={e => editVal(mi, c.id, e.target.value)} /></td>)}
        </tr>)}</tbody></table></div>
    </Card></>)
}
