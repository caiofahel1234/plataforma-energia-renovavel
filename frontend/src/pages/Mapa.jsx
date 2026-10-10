import { useState } from 'react'
import { useTOPSIS } from '../hooks/useTOPSIS'
import MapaView from '../components/map/MapaView'
import { Card } from '../components/common/ui'

export default function Mapa() {
  const { ranking, criteria } = useTOPSIS(); const [crit, setCrit] = useState(null); const [heat, setHeat] = useState(false)
  const Opt = ({ id, label }) => (
    <label className="flex items-center gap-2 text-sm py-1"><input type="radio" checked={crit === id} onChange={() => setCrit(id)} className="accent-emerald-600" />{label}</label>)
  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-4">
      <Card title="Filtro por critério">
        <label className="flex items-center gap-2 text-sm pb-2 mb-2 border-b"><input type="checkbox" checked={heat} onChange={e => setHeat(e.target.checked)} className="accent-emerald-600" />Camada de calor</label>
        <Opt id={null} label="Apenas coeficiente Ci" />
        {criteria.map((c, i) => <Opt key={c.id} id={c.id} label={`C${i + 1} · ${c.nome}`} />)}
        <div className="mt-3 text-xs space-y-1">
          <p><span className="inline-block w-3 h-3 rounded-full bg-red-600 mr-1" />Alta vulnerabilidade (Ci &lt; 0,4)</p>
          <p><span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1" />Média (0,4–0,6)</p>
          <p><span className="inline-block w-3 h-3 rounded-full bg-green-600 mr-1" />Baixa (≥ 0,6)</p>
          <p className="text-slate-500">Com um critério selecionado, o raio do marcador é proporcional ao seu valor.</p>
        </div>
      </Card>
      <MapaView ranking={ranking} criteria={criteria} criterio={crit} heat={heat} height="h-[70vh]" />
    </div>)
}
