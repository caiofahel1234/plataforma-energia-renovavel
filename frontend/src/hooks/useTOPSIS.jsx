import { createContext, useContext, useState, useMemo } from 'react'
import { MUNICIPIOS, CRITERIOS } from '../services/mockData'
import { calcular, topsis } from '../services/topsisService'

const Ctx = createContext()
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }

export function TopsisProvider({ children }) {
  const [munis, setMunis] = useState(() => load('munis', MUNICIPIOS))
  const [criteria, setCriteria] = useState(() => CRITERIOS.map(c => ({ ...c })))
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState(() => load('hist', []))
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = (msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200) }
  const saveMunis = l => { setMunis(l); localStorage.setItem('munis', JSON.stringify(l)); setResult(null) }

  // Ranking vigente: último resultado ou cálculo local com os pesos atuais
  const ranking = useMemo(() => result?.ranking ?? topsis(munis, criteria), [result, munis, criteria])

  const run = async () => {
    setLoading(true)
    try {
      const r = await calcular(munis, criteria)
      setResult(r)
      const h = [{ id: Date.now(), date: new Date().toISOString(), criteria: criteria.map(c => ({ ...c })), ranking: r.ranking, source: r.source }, ...history].slice(0, 20)
      setHistory(h); localStorage.setItem('hist', JSON.stringify(h))
      notify(`Simulação concluída (${r.source})`); return true
    } catch (e) { notify(e.message, 'err'); return false } finally { setLoading(false) }
  }
  const reopen = h => { setCriteria(h.criteria); setResult({ ranking: h.ranking, source: h.source }) }

  return <Ctx.Provider value={{ munis, saveMunis, criteria, setCriteria, ranking, result, run, reopen, history, loading, toast, notify }}>{children}</Ctx.Provider>
}
export const useTOPSIS = () => useContext(Ctx)
