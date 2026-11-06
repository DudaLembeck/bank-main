import { supabase } from './supabase'

export interface Anuncio {
  id: number
  texto: string
  fixado: boolean
  origem: 'manual' | 'automatico'
  data: string
  perfil: { nome: string } | null
  evento: { nome: string } | null
}

const traducoes: [string, string][] = [
  ['row-level security', 'Só a comissão pode mexer nos anúncios.'],
  ['permission denied', 'Só a comissão pode mexer nos anúncios.'],
  ['violates check constraint', 'O texto do anúncio está fora do permitido.'],
  ['Failed to fetch', 'Sem conexão com a internet.'],
  ['NetworkError', 'Sem conexão com a internet.']
]

function traduzirErro(mensagem: string): string {
  const achado = traducoes.find(([chave]) =>
    mensagem.toLowerCase().includes(chave.toLowerCase())
  )
  return achado ? achado[1] : `Não foi possível concluir: ${mensagem}`
}

export async function listarAnuncios(limite = 50): Promise<Anuncio[]> {
  const { data, error } = await supabase
    .from('anuncio')
    .select('id, texto, fixado, origem, data, perfil(nome), evento(nome)')
    .order('fixado', { ascending: false })
    .order('data', { ascending: false })
    .limit(limite)
  if (error) throw new Error(traduzirErro(error.message))
  return (data ?? []) as unknown as Anuncio[]
}

export async function publicarAnuncio(
  idUsuario: string,
  texto: string,
  idEvento: number | null,
  fixado: boolean
): Promise<void> {
  const { error } = await supabase.from('anuncio').insert({
    id_usuario: idUsuario,
    id_evento: idEvento,
    texto: texto.trim(),
    fixado
  })
  if (error) throw new Error(traduzirErro(error.message))
}

export async function alternarFixado(
  id: number,
  fixado: boolean
): Promise<void> {
  const { data, error } = await supabase
    .from('anuncio')
    .update({ fixado })
    .eq('id', id)
    .select('id')
  if (error) throw new Error(traduzirErro(error.message))
  if (!data?.length) throw new Error('Só a comissão pode fixar anúncios.')
}

export async function removerAnuncio(id: number): Promise<void> {
  const { data, error } = await supabase
    .from('anuncio')
    .delete()
    .eq('id', id)
    .select('id')
  if (error) throw new Error(traduzirErro(error.message))
  if (!data?.length) throw new Error('Só a comissão pode apagar anúncios.')
}
