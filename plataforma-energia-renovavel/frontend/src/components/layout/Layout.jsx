import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, SlidersHorizontal, ListOrdered, Building2, Map, LogOut, Zap, Loader2, Users, ScrollText, LineChart, Play } from 'lucide-react'
import { useAuth, ROLE_UI, NAV } from '../../hooks/useAuth'
import { useTOPSIS } from '../../hooks/useTOPSIS'

const ICONS = { '/': LayoutDashboard, '/configuracao': SlidersHorizontal, '/resultados': ListOrdered, '/municipios': Building2, '/mapa': Map, '/usuarios': Users, '/auditoria': ScrollText, '/analise': LineChart, '/executar': Play }

export default function Layout() {
  const { user, logout } = useAuth(); const nav = useNavigate(); const { loading, toast } = useTOPSIS()
  const ui = ROLE_UI[user.papel]; const menu = NAV[user.papel]
  const cls = ({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`
  const Item = ([to, t]) => { const I = ICONS[to]; return <NavLink key={to} to={to} end={to === '/'} className={cls}><I size={16} />{t}</NavLink> }
  return (
    <div className="min-h-screen md:flex" data-papel={user.papel}>
      <aside className="hidden md:flex flex-col w-64 bg-slate-800 p-4 gap-1">
        <div className="flex items-center gap-2 text-emerald-400 font-bold mb-3"><Zap /> VSE · TOPSIS</div>
        <div className="rounded-lg bg-slate-700/60 p-3 text-xs text-slate-300 mb-3">
          <span className={`px-2 py-0.5 rounded font-semibold ${ui.badge}`}>{ui.label}</span>
          <p className="mt-2 leading-snug">{ui.desc}</p>
        </div>
        {menu.map(Item)}
      </aside>
      <div className="flex-1 min-w-0">
        <header className={`${ui.header} text-white px-4 py-3 flex justify-between items-center`}>
          <span className="font-semibold text-sm md:text-base">Vulnerabilidade Social Energética</span>
          <span className="flex items-center gap-3 text-xs">{user.nome}<span className={`px-2 py-0.5 rounded font-semibold ${ui.badge}`}>{ui.label}</span>
            <button title="Sair" onClick={async () => { await logout(); nav('/login') }}><LogOut size={16} /></button></span>
        </header>
        <nav className="md:hidden flex gap-1 overflow-x-auto bg-slate-800 p-2">{menu.map(Item)}</nav>
        <main className="p-4 md:p-6 space-y-4"><Outlet /></main>
        <footer className="text-center text-xs text-slate-400 pb-4">Dados fictícios para demonstração</footer>
      </div>
      {loading && <div className="fixed inset-0 z-[2000] bg-black/30 flex items-center justify-center"><Loader2 className="animate-spin text-white" size={48} /></div>}
      {toast && <div className={`fixed bottom-4 right-4 z-[2000] px-4 py-3 rounded-lg text-white shadow ${toast.type === 'err' ? 'bg-red-600' : 'bg-emerald-700'}`}>{toast.msg}</div>}
    </div>)
}
