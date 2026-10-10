// Cliente HTTP. JWT fica em cookie httpOnly (inacessível ao JS => mitiga XSS). Só o token CSRF vive em memória.
const BASE = import.meta.env.VITE_API_URL || '' // apenas URL pública; nenhum segredo no bundle
export const API_ON = Boolean(BASE)
let csrf = null
export const setCsrf = t => { csrf = t }
export class ApiError extends Error { constructor(status) { super('Falha na requisição'); this.status = status } }
export async function api(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (method !== 'GET' && csrf) headers['X-CSRF-Token'] = csrf
  let r
  try { r = await fetch(BASE + path, { method, headers, credentials: 'include', body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(10000) }) }
  catch { throw new ApiError(0) }
  if (!r.ok) throw new ApiError(r.status)
  return r.status === 204 ? null : r.json()
}
// Mensagens genéricas: nunca exibe detalhes do servidor
export const erroGenerico = e => ({ 401: 'Credenciais inválidas ou sessão expirada.', 403: 'Você não tem permissão para esta ação.',
  409: 'Registro em conflito com dados existentes.', 429: 'Muitas tentativas. Aguarde alguns minutos.', 400: 'Dados inválidos. Revise os campos.', 422: 'Dados insuficientes ou inválidos para a operação.' }[e?.status] || 'Não foi possível concluir a operação.')
// Download autenticado (relatórios gerados no servidor)
export async function baixar(path, nome) {
  let r; try { r = await fetch(BASE + path, { credentials: 'include' }) } catch { throw new ApiError(0) }
  if (!r.ok) throw new ApiError(r.status)
  const a = document.createElement('a'); a.href = URL.createObjectURL(await r.blob()); a.download = nome; a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
