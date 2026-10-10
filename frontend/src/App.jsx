import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ConfiguracaoTOPSIS from './pages/ConfiguracaoTOPSIS'
import Resultados from './pages/Resultados'
import Municipios from './pages/Municipios'
import Mapa from './pages/Mapa'
import Usuarios from './pages/Usuarios'
import ExecutarTOPSIS from './pages/ExecutarTOPSIS'
import Analise from './pages/Analise'
import Auditoria from './pages/Auditoria'
import { useAuth, PERM } from './hooks/useAuth'

// Guarda de rota: sessão validada no servidor (/auth/me), não por flag no localStorage
function Protected({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return <p className="p-6 text-slate-500">Carregando…</p>
  return user ? children : <Navigate to="/login" replace />
}
const Role = ({ allow, children }) => { const { user } = useAuth(); return allow.includes(user.papel) ? children : <Navigate to="/" replace /> }

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="configuracao" element={<Role allow={PERM.criterios}><ConfiguracaoTOPSIS /></Role>} />
        <Route path="executar" element={<Role allow={PERM.topsis}><ExecutarTOPSIS /></Role>} />
        <Route path="analise" element={<Role allow={PERM.analise}><Analise /></Role>} />
        <Route path="auditoria" element={<Role allow={PERM.auditoria}><Auditoria /></Role>} />
        <Route path="resultados" element={<Resultados />} />
        <Route path="municipios" element={<Municipios />} />
        <Route path="mapa" element={<Mapa />} />
        <Route path="usuarios" element={<Role allow={PERM.usuarios}><Usuarios /></Role>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
