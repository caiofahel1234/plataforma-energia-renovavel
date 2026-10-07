import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react'
import { MUNICIPIOS, CRITERIOS } from '../services/mockData'
import { calcular, topsis } from '../services/topsisService'
import { api, API_ON, erroGenerico } from '../services/api'
import { useAuth } from './useAuth'
import { municipioSeguro, limpa } from '../utils/sanitize'

const Ctx = createContext()
const loadMunis = () => { // dados de localStorage são tratados como não confiáveis
  try { const l = JSON.parse(localStorage.getItem('munis')); const ids = CRITERIOS.map(c => c.id); const ok = l.map(m => municipioSeguro(m, ids) && m).filter(Boolean); return ok.length ? ok : MUNICIPIOS } catch { return MUNICIPIOS }
}
const loadCriteria = () => { // configuração oficial (modo demo) – dado de storage é não confiável
  try { const c = JSON.parse(localStorage.getItem('criteria')); if (Array.isArray(c) && c.length >= 2 && c.every(x => x && typeof x.id === 'string' && typeof x.nome === 'string' && ['benefit', 'cost'].includes(x.type) && Number.isFinite(x.weight) && x.weight >= 0 && x.weight <= 100)) return c.map(x => ({ ...x, nome: limpa(x.nome), unit: limpa(x.unit) })) } catch { /* usa padrão */ }
  return CRITERIOS.map(c => ({ ...c }))
}
const loadHist = () => { try { const h = JSON.parse(localStorage.getItem('hist')); return Array.isArray(h) ? h.slice(0, 20) : [] } catch { return [] } }

export function TopsisProvider({ children }) {
  const { user } = useAuth()
  const [munis, setMunis] = useState(() => API_ON ? [] : loadMunis())
  const [criteria, setCriteria] = useState(() => API_ON ? [] : loadCriteria())
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState(() => API_ON ? [] : loadHist())
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const notify = (msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200) }

  const reload = useCallback(async () => {
    if (!API_ON || !user) return
    try {
      const [m, c, h] = await Promise.all([api('/municipios'), api('/criterios'), api('/simulacoes')])
      setMunis(m); setCriteria(c.map(x => ({ ...x, weight: Math.round(x.weight * 100) })))
      setHistory(h.map(s => ({ id: s.id, date: s.data_execucao, source: 'API', pesos: s.parametros.criterios.map(c => Math.round(c.peso * 100)), top: s.parametros.top })))
    } catch (e) { notify(erroGenerico(e), 'err') }
  }, [user])
  useEffect(() => { reload() }, [reload])

  const persistMunis = l => { setMunis(l); localStorage.setItem('munis', JSON.stringify(l)); setResult(null) }
  const wrap = async fn => { try { await fn(); return true } catch (e) { notify(erroGenerico(e), 'err'); return false } }

  const ranking = useMemo(() => result?.ranking ?? (munis.length >= 2 && criteria.length >= 2 ? topsis(munis, criteria) : []), [result, munis, criteria])

  const addMunicipios = list => wrap(async () => {
    if (API_ON) { for (const m of list) await api('/municipios', { method: 'POST', body: { nome: m.nome, uf: m.uf, populacao: m.populacao, idh: m.idh, lat: m.lat, lng: m.lng, values: m.values } }); await reload() }
    else persistMunis([...munis, ...list])
  })
  const removeMunicipio = id => wrap(async () => { if (API_ON) { await api(`/municipios/${id}`, { method: 'DELETE' }); await reload() } else persistMunis(munis.filter(m => m.id !== id)) })
  const addCriterio = ({ nome, type, unit }) => wrap(async () => {
    if (API_ON) { await api('/criterios', { method: 'POST', body: { nome, tipo: type === 'benefit' ? 'beneficio' : 'custo', unidade: unit || undefined, peso: 0 } }); await reload() }
    else { const id = 'c' + Date.now(); setCriteria(cs => [...cs, { id, nome, type, unit, weight: 0 }]); setMunis(ms => ms.map(m => ({ ...m, values: { ...m.values, [id]: 0 } }))); setResult(null) }
  })
  const removeCriterio = id => wrap(async () => { if (API_ON) { await api(`/criterios/${id}`, { method: 'DELETE' }); await reload() } else { setCriteria(cs => cs.filter(c => c.id !== id)); setResult(null) } })

  // UC02: grava tipos/pesos como configuração OFICIAL (o Gestor Público executa sempre com ela)
  const salvarConfig = async () => {
    const ok = await wrap(async () => {
      if (API_ON) { for (const c of criteria) await api(`/criterios/${c.id}`, { method: 'PUT', body: { tipo: c.type === 'benefit' ? 'beneficio' : 'custo', peso: c.weight / 100 } }); await reload() }
      else localStorage.setItem('criteria', JSON.stringify(criteria))
    })
    if (ok) notify('Configuração oficial salva'); return ok
  }
  const run = async (opts = {}) => {
    setLoading(true)
    try {
      const r = await calcular(munis, criteria, opts.municipioIds); setResult(r)
      if (r.source === 'API') await reload()
      else {
        const h = [{ id: Date.now(), date: new Date().toISOString(), source: r.source, pesos: criteria.map(c => c.weight), top: r.ranking[0].nome, criteria: criteria.map(c => ({ ...c })), ranking: r.ranking }, ...history].slice(0, 20)
        setHistory(h); localStorage.setItem('hist', JSON.stringify(h))
      }
      notify(`Simulação concluída (${r.source})`); return true
    } catch (e) { notify(erroGenerico(e), 'err'); return false } finally { setLoading(false) }
  }
  const reopen = h => wrap(async () => {
    if (h.ranking) { setCriteria(h.criteria); setResult({ ranking: h.ranking, source: h.source }); return }
    const s = await api(`/simulacoes/${h.id}`)
    setCriteria(cs => cs.map(c => { const p = s.parametros.criterios.find(x => x.id === c.id); return p ? { ...c, weight: Math.round(p.peso * 100), type: p.tipo === 'beneficio' ? 'benefit' : 'cost' } : c }))
    setResult({ ranking: s.ranking, source: 'API', simulacaoId: s.id })
  })

  return <Ctx.Provider value={{ munis, criteria, setCriteria, ranking, result, run, reopen, history, loading, toast, notify, addMunicipios, removeMunicipio, addCriterio, removeCriterio, persistMunis, salvarConfig }}>{children}</Ctx.Provider>
}
export const useTOPSIS = () => useContext(Ctx)
