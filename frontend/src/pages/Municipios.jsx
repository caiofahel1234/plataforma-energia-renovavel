import { useState } from 'react'
import { Upload } from 'lucide-react'
import { useTOPSIS } from '../hooks/useTOPSIS'
import { useAuth } from '../hooks/useAuth'
import { CRITERIOS } from '../services/mockData'
import { Card, Btn, Field, Modal, Table, inputCls } from '../components/common/ui'
import { fmtInt } from '../utils/formatters'

const base = { nome: '', uf: '', populacao: '', idh: '', lat: '', lng: '' }
const extras = CRITERIOS.filter(c => c.id !== 'c5') // IDH alimenta o C5
const vazio = () => ({ ...base, ...Object.fromEntries(extras.map(c => [c.id, ''])) })

export default function Municipios() {
  const { munis, saveMunis, notify } = useTOPSIS(); const { user } = useAuth()
  const [f, setF] = useState(vazio()); const [err, setErr] = useState({}); const [open, setOpen] = useState(false)
  const can = user?.papel !== 'Pesquisador'
  const set = k => e => setF({ ...f, [k]: e.target.value })

  const submit = e => {
    e.preventDefault(); const er = {}
    if (f.nome.trim().length < 2) er.nome = 'Informe o nome'
    if (!/^[A-Za-z]{2}$/.test(f.uf)) er.uf = 'UF com 2 letras'
    if (!(+f.populacao > 0)) er.populacao = 'Valor positivo'
    if (f.idh === '' || !(+f.idh >= 0 && +f.idh <= 1)) er.idh = 'Entre 0 e 1'
    if (f.lat === '' || !(+f.lat >= -90 && +f.lat <= 90)) er.lat = 'Latitude inválida'
    if (f.lng === '' || !(+f.lng >= -180 && +f.lng <= 180)) er.lng = 'Longitude inválida'
    extras.forEach(c => { if (f[c.id] === '' || isNaN(+f[c.id])) er[c.id] = 'Obrigatório' })
    setErr(er); if (Object.keys(er).length) return notify('Corrija os campos destacados', 'err')
    const values = { c5: +f.idh, ...Object.fromEntries(extras.map(c => [c.id, +f[c.id]])) }
    saveMunis([...munis, { id: Date.now(), nome: f.nome, uf: f.uf.toUpperCase(), populacao: +f.populacao, lat: +f.lat, lng: +f.lng, values }])
    setF(vazio()); notify('Município cadastrado')
  }

  // Importação: JSON (array de municípios) ou CSV nome,uf,populacao,lat,lng,c1..c7
  const importar = file => {
    const rd = new FileReader()
    rd.onload = () => {
      try {
        let list
        if (file.name.endsWith('.json')) list = JSON.parse(rd.result)
        else list = rd.result.trim().split('\n').slice(1).map((l, i) => {
          const p = l.split(/[;,]/); const v = p.slice(5, 12).map(Number)
          return { id: Date.now() + i, nome: p[0], uf: p[1], populacao: +p[2], lat: +p[3], lng: +p[4], values: Object.fromEntries(v.map((x, k) => ['c' + (k + 1), x])) }
        })
        saveMunis([...munis, ...list.map((m, i) => ({ ...m, id: m.id ?? Date.now() + i }))]); notify(`${list.length} municípios importados`); setOpen(false)
      } catch { notify('Arquivo inválido', 'err') }
    }
    rd.readAsText(file)
  }

  return (<>
    {can && <Card title="Novo município">
      <form onSubmit={submit} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[['nome', 'Nome'], ['uf', 'UF'], ['populacao', 'População'], ['idh', 'IDH'], ['lat', 'Latitude'], ['lng', 'Longitude']].map(([k, l]) =>
          <Field key={k} label={l} error={err[k]}><input className={inputCls} value={f[k]} onChange={set(k)} /></Field>)}
        {extras.map(c => <Field key={c.id} label={`${c.nome} (${c.unit})`} error={err[c.id]}><input className={inputCls} value={f[c.id]} onChange={set(c.id)} /></Field>)}
        <div className="flex items-end gap-2"><Btn>Cadastrar</Btn><Btn type="button" variant="ghost" onClick={() => setOpen(true)}><Upload size={14} className="inline mr-1" />Importar</Btn></div>
      </form></Card>}
    <Card title="Municípios cadastrados">
      <Table rows={munis} cols={[{ h: 'Nome', r: r => r.nome }, { h: 'UF', r: r => r.uf }, { h: 'População', r: r => fmtInt(r.populacao) },
        { h: 'IDH', r: r => r.values.c5 }, { h: 'Lat/Lng', r: r => `${r.lat}, ${r.lng}` }]} />
    </Card>
    {open && <Modal title="Importar CSV/JSON" onClose={() => setOpen(false)}>
      <p className="text-xs text-slate-500 mb-2">CSV: cabeçalho + nome,uf,populacao,lat,lng,c1..c7. JSON: array de municípios.</p>
      <input type="file" accept=".csv,.json" onChange={e => e.target.files[0] && importar(e.target.files[0])} /></Modal>}
  </>)
}
