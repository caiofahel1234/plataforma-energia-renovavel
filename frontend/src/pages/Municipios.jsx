import { useState } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import { useTOPSIS } from '../hooks/useTOPSIS'
import { useAuth, PERM } from '../hooks/useAuth'
import { Card, Btn, Field, Modal, Table, inputCls } from '../components/common/ui'
import { fmtInt } from '../utils/formatters'
import { api, API_ON, erroGenerico } from '../services/api'
import { municipioSeguro } from '../utils/sanitize'

const base = { nome: '', uf: '', populacao: '', idh: '', lat: '', lng: '' }
const MAX_BYTES = 1_000_000, MAX_ROWS = 500

export default function Municipios() {
  const { munis, criteria, addMunicipios, removeMunicipio, notify } = useTOPSIS(); const { user } = useAuth()
  const [f, setF] = useState(base); const [vals, setVals] = useState({}); const [err, setErr] = useState({}); const [open, setOpen] = useState(false)
  const can = PERM.municipios.includes(user.papel) // UC01: Administrador
  const ids = criteria.map(c => String(c.id))
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const [busca, setBusca] = useState('')
  // Busca por código IBGE (7 dígitos) ou CEP (8 dígitos) – via backend (RF09)
  const buscar = async () => {
    const d = busca.replace(/\D/g, ''); const path = d.length === 7 ? `/importacao/ibge/${d}` : d.length === 8 ? `/importacao/cep/${d}` : null
    if (!path) return notify('Informe 7 dígitos (IBGE) ou 8 (CEP)', 'err')
    try { const r = await api(path); setF(x => ({ ...x, nome: r.nome, uf: r.uf, populacao: r.populacao ?? x.populacao })); notify('Dados importados do IBGE') } catch (e) { notify(erroGenerico(e), 'err') }
  }

  const submit = async e => {
    e.preventDefault()
    const m = municipioSeguro({ ...f, values: vals }, ids); const er = {}
    if (!m) { // identifica campos para feedback visual
      if (f.nome.trim().length < 2) er.nome = ' Informe o nome'; if (!/^[A-Za-z]{2}$/.test(f.uf)) er.uf = ' UF com 2 letras'
      if (!(+f.populacao >= 0) || f.populacao === '') er.populacao = ' Valor inválido'; if (f.lat === '' || Math.abs(+f.lat) > 90) er.lat = ' Latitude inválida'
      if (f.lng === '' || Math.abs(+f.lng) > 180) er.lng = ' Longitude inválida'
      ids.forEach(id => { if (vals[id] === undefined || vals[id] === '' || isNaN(+vals[id])) er[id] = ' Obrigatório' })
      if (!Object.keys(er).length) er.nome = ' Dados inválidos'
      setErr(er); return notify('Corrija os campos destacados', 'err')
    }
    if (f.idh !== '' && !(+f.idh >= 0 && +f.idh <= 1)) { setErr({ idh: ' Entre 0 e 1' }); return }
    setErr({}); if (await addMunicipios([m])) { setF(base); setVals({}); notify('Município cadastrado') }
  }

  const importar = file => {
    if (file.size > MAX_BYTES) return notify('Arquivo muito grande (máx. 1 MB)', 'err')
    const rd = new FileReader()
    rd.onload = async () => {
      try {
        let raw
        if (file.name.endsWith('.json')) raw = JSON.parse(rd.result)
        else raw = String(rd.result).trim().split('\n').slice(1).map(l => { const p = l.split(/[;,]/); return { nome: p[0], uf: p[1], populacao: p[2], lat: p[3], lng: p[4], values: Object.fromEntries(ids.map((id, k) => [id, p[5 + k]])) } })
        if (!Array.isArray(raw) || raw.length > MAX_ROWS) throw new Error('formato')
        const ok = raw.map(m => municipioSeguro(m, ids)).filter(Boolean) // descarta registros inválidos
        if (!ok.length) return notify('Nenhum registro válido no arquivo', 'err')
        if (await addMunicipios(ok)) { notify(`${ok.length} importados, ${raw.length - ok.length} descartados`); setOpen(false) }
      } catch { notify('Arquivo inválido', 'err') }
    }
    rd.readAsText(file)
  }

  return (<>
    {can && <Card title="Novo município">
      {API_ON && <div className="flex gap-2 mb-3"><input className={inputCls} placeholder="Buscar por código IBGE (7 dígitos) ou CEP (8 dígitos)" inputMode="numeric" maxLength={9} value={busca} onChange={e => setBusca(e.target.value)} /><Btn type="button" variant="ghost" onClick={buscar}>Buscar</Btn></div>}
      <form onSubmit={submit} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[['nome', 'Nome'], ['uf', 'UF'], ['populacao', 'População'], ['idh', 'IDH'], ['lat', 'Latitude'], ['lng', 'Longitude']].map(([k, l]) =>
          <Field key={k} label={l} error={err[k]}><input className={inputCls} maxLength={120} value={f[k]} onChange={set(k)} /></Field>)}
        {criteria.map((c, i) => <Field key={c.id} label={`C${i + 1} · ${c.nome} (${c.unit})`} error={err[c.id]}><input className={inputCls} value={vals[c.id] ?? ''} onChange={e => setVals({ ...vals, [c.id]: e.target.value })} /></Field>)}
        <div className="flex items-end gap-2"><Btn>Cadastrar</Btn><Btn type="button" variant="ghost" onClick={() => setOpen(true)}><Upload size={14} className="inline mr-1" />Importar</Btn></div>
      </form></Card>}
    <Card title={can ? 'Municípios cadastrados' : 'Comunidades monitoradas (somente leitura)'}>
      <Table rows={munis} cols={[{ h: 'Nome', r: r => r.nome }, { h: 'UF', r: r => r.uf }, { h: 'População', r: r => fmtInt(r.populacao) }, { h: 'IDH', r: r => r.idh ?? '—' }, { h: 'Lat/Lng', r: r => `${r.lat}, ${r.lng}` },
        ...(can ? [{ h: '', r: r => <button title="Excluir" onClick={() => window.confirm(`Excluir ${r.nome}?`) && removeMunicipio(r.id)}><Trash2 size={14} className="text-red-500" /></button> }] : [])]} />
    </Card>
    {open && <Modal title="Importar CSV/JSON" onClose={() => setOpen(false)}>
      <p className="text-xs text-slate-500 mb-2">CSV: cabeçalho + nome,uf,populacao,lat,lng,C1..Cn. JSON: array de municípios. Máx. 1 MB / 500 registros; registros inválidos são descartados.</p>
      <input type="file" accept=".csv,.json" onChange={e => e.target.files[0] && importar(e.target.files[0])} /></Modal>}
  </>)
}
