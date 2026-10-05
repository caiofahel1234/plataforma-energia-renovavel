import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useAuth, PAPEIS } from '../hooks/useAuth'
import { Btn, Field, inputCls } from '../components/common/ui'

export default function Login() {
  const { login } = useAuth(); const nav = useNavigate()
  const [f, setF] = useState({ email: '', senha: '', papel: PAPEIS[0] }); const [err, setErr] = useState({})
  const submit = e => {
    e.preventDefault(); const er = {}
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'E-mail inválido'
    if (f.senha.length < 6) er.senha = 'Mínimo de 6 caracteres'
    setErr(er); if (Object.keys(er).length) return
    login(f.email, f.papel); nav('/')
  }
  const set = k => e => setF({ ...f, [k]: e.target.value })
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-800 to-emerald-600 p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg"><Zap /> Vulnerabilidade Energética</div>
        <Field label="E-mail" error={err.email}><input className={inputCls} value={f.email} onChange={set('email')} /></Field>
        <Field label="Senha" error={err.senha}><input type="password" className={inputCls} value={f.senha} onChange={set('senha')} /></Field>
        <Field label="Perfil"><select className={inputCls} value={f.papel} onChange={set('papel')}>{PAPEIS.map(p => <option key={p}>{p}</option>)}</select></Field>
        <Btn className="w-full">Entrar</Btn>
      </form>
    </div>)
}
