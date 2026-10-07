import { useEffect, useState } from 'react'
import { api, API_ON, erroGenerico } from '../services/api'
import { useTOPSIS } from '../hooks/useTOPSIS'
import { PAPEIS } from '../hooks/useAuth'
import { senhaForte, limpa } from '../utils/sanitize'
import { Card, Btn, Field, Table, inputCls } from '../components/common/ui'

// RF08: gestão de usuários (somente Administrador; o servidor reforça o RBAC)
export default function Usuarios() {
  const { notify } = useTOPSIS()
  const [lista, setLista] = useState([]); const [f, setF] = useState({ nome: '', email: '', papel: 'gestor', senha: '', conf: '' })
  const carregar = () => api('/usuarios').then(setLista).catch(e => notify(erroGenerico(e), 'err'))
  useEffect(() => { if (API_ON) carregar() }, [])
  if (!API_ON) return <Card title="Usuários"><p className="text-sm text-slate-500">Disponível apenas com a API configurada.</p></Card>
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const forte = senhaForte(f.senha)
  const submit = async e => {
    e.preventDefault()
    if (!forte || f.senha !== f.conf || limpa(f.nome).length < 2) return notify('Verifique nome e senha', 'err')
    try { await api('/usuarios', { method: 'POST', body: { nome: limpa(f.nome), email: f.email.trim().toLowerCase(), papel: f.papel, senha: f.senha } }); setF({ nome: '', email: '', papel: 'gestor', senha: '', conf: '' }); notify('Usuário criado'); carregar() }
    catch (err) { notify(erroGenerico(err), 'err') }
  }
  return (<>
    <Card title="Novo usuário">
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
        <Field label="Nome"><input className={inputCls} maxLength={120} value={f.nome} onChange={set('nome')} /></Field>
        <Field label="E-mail"><input type="email" autoComplete="off" maxLength={254} className={inputCls} value={f.email} onChange={set('email')} /></Field>
        <Field label="Perfil"><select className={inputCls} value={f.papel} onChange={set('papel')}>{Object.entries(PAPEIS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        <div />
        <Field label="Senha" error={f.senha && !forte ? ' Mín. 12 caracteres, com maiúscula, minúscula, número e símbolo' : ''}><input type="password" autoComplete="new-password" maxLength={72} className={inputCls} value={f.senha} onChange={set('senha')} /></Field>
        <Field label="Confirmar senha" error={f.conf && f.conf !== f.senha ? ' Senhas diferentes' : ''}><input type="password" autoComplete="new-password" maxLength={72} className={inputCls} value={f.conf} onChange={set('conf')} /></Field>
        <Btn disabled={!forte || f.senha !== f.conf}>Criar usuário</Btn>
      </form></Card>
    <Card title="Usuários"><Table rows={lista} cols={[{ h: 'Nome', r: r => r.nome }, { h: 'E-mail', r: r => r.email }, { h: 'Perfil', r: r => PAPEIS[r.papel] }, { h: 'Ativo', r: r => r.ativo ? 'Sim' : 'Não' }]} /></Card>
  </>)
}
