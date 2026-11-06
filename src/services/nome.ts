const PARTICULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

export function nomeBonito(nome: string): string {
  return nome
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((palavra, indice) =>
      indice > 0 && PARTICULAS.has(palavra)
        ? palavra
        : palavra.charAt(0).toUpperCase() + palavra.slice(1)
    )
    .join(' ')
}

export function inicialDoNome(nome: string): string {
  return nome.trim().charAt(0).toUpperCase() || '?'
}
