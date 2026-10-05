import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, SlidersHorizontal, ListOrdered, Building2, Map, LogOut, Zap, Loader2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTOPSIS } from '../../hooks/useTOPSIS'

const links = [['/', 'Dashboard', LayoutDashboard], ['/configuracao', 'Configuração TOPSIS', SlidersHorizontal],
  ['/resultados', 'Resultados', ListOrdered], ['/municipios', 'Municípios', Building2], ['/mapa', 'Mapa', Map]]

export default function Layout() {
  const { user, logout } = useAuth(); const nav = useNavigate(); const { loading, toast } = useTOPSIS()
  const cls = ({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden md:flex flex-col w-60 bg-slate-800 p-4 gap-1">
        <div className="flex items-center gap-2 text-emerald-400 font-bold mb-4"><Zap /> VSE · TOPSIS</div>
        {links.map(([to, t, I]) => <NavLink key={to} to={to} end={to === '/'} className={cls}><I size={16} />{t}</NavLink>)}
      </aside>
      <div className="flex-1 min-w-0">
        <header className="bg-teal-800 text-white px-4 py-3 flex justify-between items-center">
          <span className="font-semibold text-sm md:text-base">Vulnerabilidade Social Energética</span>
          <span className="flex items-center gap-3 text-xs">{user?.email} · {user?.papel}
            <button title="Sair" onClick={() => { logout(); nav('/login') }}><LogOut size={16} /></button></span>
        </header>
        <nav className="md:hidden flex gap-1 overflow-x-auto bg-slate-800 p-2">
          {links.map(([to, t, I]) => <NavLink key={to} to={to} end={to === '/'} className={cls}><I size={14} />{t}</NavLink>)}</nav>
        <main className="p-4 md:p-6 space-y-4"><Outlet /></main>
        <footer className="text-center text-xs text-slate-400 pb-4">Dados fictícios para demonstração</footer>
      </div>
      {loading && <div className="fixed inset-0 z-[2000] bg-black/30 flex items-center justify-center"><Loader2 className="animate-spin text-white" size={48} /></div>}
      {toast && <div className={`fixed bottom-4 right-4 z-[2000] px-4 py-3 rounded-lg text-white shadow ${toast.type === 'err' ? 'bg-red-600' : 'bg-emerald-700'}`}>{toast.msg}</div>}
    </div>)
}
