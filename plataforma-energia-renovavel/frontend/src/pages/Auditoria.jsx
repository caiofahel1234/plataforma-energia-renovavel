import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { api, API_ON, erroGenerico } from '../services/api'
import { useTOPSIS } from '../hooks/useTOPSIS'
import EventosTabela from '../components/dashboard/EventosTabela'
import { Card, Btn, inputCls } from '../components/common/ui'

// Administrador: trilha de auditoria (login, parâmetros TOPSIS, exclusões, exportações, acessos negados, CSRF)
export default function Auditoria() {
  const { notify } = useTOPSIS()
  const [ev, setEv] = useState([]); const [filtro, setFiltro] = useState('')
  const carregar = () => api('/auditoria?limite=100').then(setEv).catch(e => notify(erroGenerico(e), 'err'))
  useEffect(() => { if (API_ON) carregar() }, [])
  if (!API_ON) return <Card title="Auditoria"><p className="text-sm text-slate-500">Disponível apenas com a API configurada.</p></Card>
  const acoes = [...new Set(ev.map(e => e.acao))].sort()
  return <Card title="Trilha de auditoria (últimos 100 eventos)">
    <div className="flex gap-2 mb-3"><select className={inputCls + ' max-w-xs'} value={filtro} onChange={e => setFiltro(e.target.value)}><option value="">Todas as ações</option>{acoes.map(a => <option key={a}>{a}</option>)}</select>
      <Btn variant="ghost" onClick={carregar}><RefreshCw size={14} className="inline mr-1" />Atualizar</Btn></div>
    <EventosTabela eventos={filtro ? ev.filter(e => e.acao === filtro) : ev} />
  </Card>
}
