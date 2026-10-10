import { useAuth } from '../hooks/useAuth'
import DashboardGestor from '../components/dashboard/DashboardGestor'
import DashboardPesquisador from '../components/dashboard/DashboardPesquisador'
import DashboardAdmin from '../components/dashboard/DashboardAdmin'
// Cada perfil tem o seu painel (Cap. 3 / 4.1 / 8)
export default function Dashboard() {
  const { user } = useAuth()
  return user.papel === 'admin' ? <DashboardAdmin /> : user.papel === 'pesquisador' ? <DashboardPesquisador /> : <DashboardGestor />
}
