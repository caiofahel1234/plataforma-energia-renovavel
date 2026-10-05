import { useState } from 'react'
export const PAPEIS = ['Gestor Público', 'Pesquisador', 'Administrador']
export function useAuth() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })
  const login = (email, papel) => {
    // Token JWT simulado; com backend real, trocar por POST /auth/login
    localStorage.setItem('token', 'mock.' + btoa(JSON.stringify({ email, papel })) + '.sig')
    const u = { email, papel }; localStorage.setItem('user', JSON.stringify(u)); setUser(u)
  }
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null) }
  return { user, login, logout }
}
