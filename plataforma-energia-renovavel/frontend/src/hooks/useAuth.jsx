import { createContext, useContext, useEffect, useState } from 'react'
import { api, API_ON, setCsrf } from '../services/api'
export const PAPEIS = { admin: 'Administrador', pesquisador: 'Pesquisador', gestor: 'Gestor Público' }
// RBAC no cliente (apenas UX; a autorização real está no servidor)
export const PERM = { municipios: ['admin'], criterios: ['admin', 'pesquisador'], topsis: ['admin', 'pesquisador', 'gestor'], usuarios: ['admin'], analise: ['admin', 'pesquisador'], auditoria: ['admin'] }
// Identidade visual e menu de cada perfil (Cap. 3 e 4.1): cada ator tem uma experiência própria
export const ROLE_UI = {
  admin: { label: 'Administrador', header: 'bg-slate-900', badge: 'bg-amber-400 text-slate-900', desc: 'Cadastra municípios (UC01), gerencia usuários e acompanha a auditoria. Acesso total.' },
  pesquisador: { label: 'Pesquisador', header: 'bg-sky-900', badge: 'bg-sky-300 text-sky-950', desc: 'Configura critérios e pesos (UC02) e analisa correlações entre indicadores.' },
  gestor: { label: 'Gestor Público', header: 'bg-teal-800', badge: 'bg-emerald-300 text-emerald-950', desc: 'Executa o TOPSIS com a configuração oficial (UC03) e gera relatórios (UC04) para políticas públicas.' },
}
export const NAV = {
  admin: [['/', 'Painel Administrativo'], ['/municipios', 'Municípios (cadastro)'], ['/usuarios', 'Usuários'], ['/auditoria', 'Auditoria'], ['/configuracao', 'Critérios e pesos'], ['/analise', 'Análise de indicadores'], ['/resultados', 'Resultados'], ['/mapa', 'Mapa']],
  pesquisador: [['/', 'Painel de Pesquisa'], ['/configuracao', 'Configurar critérios'], ['/analise', 'Análise de indicadores'], ['/resultados', 'Resultados'], ['/mapa', 'Mapa'], ['/municipios', 'Dados dos municípios']],
  gestor: [['/', 'Painel de Gestão'], ['/executar', 'Executar TOPSIS'], ['/resultados', 'Resultados e relatórios'], ['/mapa', 'Mapa de vulnerabilidade'], ['/municipios', 'Comunidades']],
}
// Modo demo SOMENTE em desenvolvimento e sem API configurada; nunca em build de produção
const DEMO = !API_ON && import.meta.env.DEV
const Ctx = createContext()
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [ready, setReady] = useState(false)
  useEffect(() => {
    (async () => {
      try {
        if (API_ON) { const d = await api('/auth/me'); setCsrf(d.csrf); setUser(d.user) }
        else if (DEMO) { const p = sessionStorage.getItem('demoPapel'); if (p && PAPEIS[p]) setUser({ nome: 'Demo', email: 'demo@local', papel: p }) }
      } catch { /* sem sessão */ }
      setReady(true)
    })()
  }, [])
  const login = async (email, senha, papel) => {
    if (API_ON) { const d = await api('/auth/login', { method: 'POST', body: { email, senha } }); setCsrf(d.csrf); setUser(d.user) }
    else if (DEMO) { sessionStorage.setItem('demoPapel', papel); setUser({ nome: 'Demo', email, papel }) }
    else throw new Error('API não configurada')
  }
  const logout = async () => { try { if (API_ON) await api('/auth/logout', { method: 'POST' }) } catch { /* ignora */ } sessionStorage.removeItem('demoPapel'); setCsrf(null); setUser(null) }
  return <Ctx.Provider value={{ user, ready, login, logout, demo: DEMO }}>{children}</Ctx.Provider>
}
export const useAuth = () => useContext(Ctx)
