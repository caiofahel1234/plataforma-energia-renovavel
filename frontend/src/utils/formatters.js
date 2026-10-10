export const fmt = (n, d = 4) => Number(n).toFixed(d).replace('.', ',')
export const fmtInt = n => Number(n).toLocaleString('pt-BR')
export const fmtDate = iso => new Date(iso).toLocaleString('pt-BR')
// Faixas do coeficiente Ci: vermelho = alta vulnerabilidade (Ci baixo)
export const faixa = ci => ci < 0.4 ? { cor: '#dc2626', rotulo: 'Alta vulnerabilidade' }
  : ci < 0.6 ? { cor: '#eab308', rotulo: 'Média vulnerabilidade' } : { cor: '#16a34a', rotulo: 'Baixa vulnerabilidade' }
