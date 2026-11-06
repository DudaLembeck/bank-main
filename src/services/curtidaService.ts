import { supabase } from './supabase'

export type AlvoCurtida = 'post' | 'anuncio' | 'duvida' | 'foto'

const traducoes: [string, string][] = [
  ['row-level security', 'Você não tem permissão para curtir.'],
  ['Failed to fetch', 'Sem conexão com a internet.'],
  ['NetworkError', 'Sem conexão com a internet.']
]

function traduzirErro(mensagem: string): string {
  const achado = traducoes.find(([chave]) =>
    mensagem.toLowerCase().includes(chave.toLowerCase())
  )
  return achado ? achado[1] : `Não foi possível concluir: ${mensagem}`
}

export async function curtir(
  idUsuario: string,
  alvoTipo: AlvoCurtida,
  alvoId: number
): Promise<void> {
  const { error } = await supabase.from('curtida').insert({
    id_usuario: idUsuario,
    alvo_tipo: alvoTipo,
    alvo_id: alvoId
  })
  if (error && error.code !== '23505') {
    throw new Error(traduzirErro(error.message))
  }
}

export async function descurtir(
  idUsuario: string,
  alvoTipo: AlvoCurtida,
  alvoId: number
): Promise<void> {
  const { error } = await supabase
    .from('curtida')
    .delete()
    .eq('id_usuario', idUsuario)
    .eq('alvo_tipo', alvoTipo)
    .eq('alvo_id', alvoId)
  if (error) throw new Error(traduzirErro(error.message))
}
