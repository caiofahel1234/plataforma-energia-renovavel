import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ConfiguracaoTOPSIS from './pages/ConfiguracaoTOPSIS'
import Resultados from './pages/Resultados'
import Municipios from './pages/Municipios'
import Mapa from './pages/Mapa'

// Rota protegida: exige token JWT (mock) no localStorage
const Protected = ({ children }) => localStorage.getItem('token') ? children : <Navigate to="/login" replace />

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="configuracao" element={<ConfiguracaoTOPSIS />} />
        <Route path="resultados" element={<Resultados />} />
        <Route path="municipios" element={<Municipios />} />
        <Route path="mapa" element={<Mapa />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
