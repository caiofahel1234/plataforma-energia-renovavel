import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useAuth, PAPEIS } from '../hooks/useAuth'
import { erroGenerico, API_ON } from '../services/api'
import { Btn, Field, inputCls } from '../components/common/ui'

export default function Login() {
  const { login, demo } = useAuth(); const nav = useNavigate()
  const [f, setF] = useState({ email: '', senha: '', papel: 'gestor' }); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const submit = async e => {
    e.preventDefault()
    if (!f.email.trim() || !f.senha) return setMsg('Informe e-mail e senha.')
    setBusy(true); setMsg('')
    try { await login(f.email.trim(), f.senha, f.papel); nav('/') } catch (err) { setMsg(erroGenerico(err)) } finally { setBusy(false) } // mensagem única, sem revelar o motivo
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-800 to-emerald-600 p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg"><Zap /> Vulnerabilidade Energética</div>
        {demo && <p className="text-xs bg-amber-100 text-amber-800 rounded p-2">Modo demonstração (somente desenvolvimento): sem autenticação real.</p>}
        {!API_ON && !demo && <p className="text-xs bg-red-100 text-red-700 rounded p-2">API não configurada (VITE_API_URL).</p>}
        <Field label="E-mail"><input type="email" autoComplete="username" maxLength={254} className={inputCls} value={f.email} onChange={set('email')} /></Field>
        <Field label="Senha"><input type="password" autoComplete="current-password" maxLength={72} className={inputCls} value={f.senha} onChange={set('senha')} /></Field>
        {demo && <Field label="Perfil (demo)"><select className={inputCls} value={f.papel} onChange={set('papel')}>{Object.entries(PAPEIS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>}
        {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
        <Btn className="w-full" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</Btn>
      </form>
    </div>)
}
