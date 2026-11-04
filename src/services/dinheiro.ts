export function paraCentavos(valor: string): number {
  const limpo = valor
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const numero = Number(limpo)
  return Number.isFinite(numero) ? Math.round(numero * 100) : 0
}

export function formatarReal(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

export function formatarComSinal(centavos: number, tipo: string): string {
  const sinal = tipo === 'entrada' ? '+' : '-'
  return `${sinal}${formatarReal(centavos)}`
}

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  })
}
