import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Building2, Layers, History, UserPlus, MapPinPlus, ScrollText } from 'lucide-react'
import { useTOPSIS } from '../../hooks/useTOPSIS'
import { api, API_ON } from '../../services/api'
import { PAPEIS } from '../../hooks/useAuth'
import KpiCard from './KpiCard'
import EventosTabela from './EventosTabela'
import { Card } from '../common/ui'
const lnk = 'inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium'

// Administrador: UC01 (cadastro), RF08 (usuários) e supervisão do sistema
export default function DashboardAdmin() {
  const { munis, criteria, history } = useTOPSIS()
  const [usuarios, setUsuarios] = useState(null); const [eventos, setEventos] = useState([])
  useEffect(() => { if (API_ON) { api('/usuarios').then(setUsuarios).catch(() => {}); api('/auditoria?limite=8').then(setEventos).catch(() => {}) } }, [])
  const celulas = munis.length * criteria.length
  const preenchidas = munis.reduce((s, m) => s + criteria.filter(c => Number.isFinite(m.values[c.id])).length, 0)
  const completude = celulas ? Math.round(100 * preenchidas / celulas) : 0
  const porPerfil = usuarios ? Object.keys(PAPEIS).map(p => [PAPEIS[p], usuarios.filter(u => u.papel === p).length]) : null
  return (<>
    <div className="rounded-xl bg-slate-100 border border-slate-300 p-4 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="font-bold text-slate-900 text-lg">Painel Administrativo</h1><p className="text-sm text-slate-700">Cadastre municípios, gerencie usuários e perfis e acompanhe a trilha de auditoria.</p></div>
      <div className="flex gap-2 flex-wrap"><Link to="/municipios" className={`${lnk} bg-slate-800 text-white`}><MapPinPlus size={14} />Novo município</Link>
        <Link to="/usuarios" className={`${lnk} bg-white border border-slate-300 text-slate-900`}><UserPlus size={14} />Usuários</Link>
        <Link to="/auditoria" className={`${lnk} bg-white border border-slate-300 text-slate-900`}><ScrollText size={14} />Auditoria</Link></div>
    </div>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <KpiCard icon={Users} label="Usuários" value={usuarios ? usuarios.length : '—'} />
      <KpiCard icon={Building2} label="Municípios" value={munis.length} />
      <KpiCard icon={Layers} label="Critérios" value={criteria.length} />
      <KpiCard icon={History} label="Simulações (histórico)" value={history.length} />
    </div>
    <div className="grid lg:grid-cols-2 gap-4">
      <Card title="Saúde dos dados">
        <p className="text-sm mb-2">Completude da matriz de decisão: <b>{completude}%</b> ({preenchidas} de {celulas} valores)</p>
        <div className="h-3 rounded bg-slate-200 overflow-hidden"><div className={`h-full ${completude === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${completude}%` }} /></div>
        <h3 className="text-sm font-semibold mt-4 mb-1">Usuários por perfil</h3>
        {porPerfil ? <ul className="text-sm">{porPerfil.map(([l, n]) => <li key={l} className="flex justify-between border-b py-1"><span>{l}</span><b>{n}</b></li>)}</ul>
          : <p className="text-sm text-slate-500">Disponível com a API configurada.</p>}
      </Card>
      <Card title="Últimos eventos de auditoria">{API_ON ? <EventosTabela eventos={eventos} /> : <p className="text-sm text-slate-500">Disponível com a API configurada.</p>}</Card>
    </div>
  </>)
}
