import { supabase } from './supabase'
import { enviarImagem, removerImagens } from './imagemService'

export interface FotoGaleria {
  id: number
  caminho: string
  legenda: string | null
  turma: string | null
  ano: number | null
  data: string
  id_usuario: string
  perfil: { nome: string } | null
  evento: { nome: string } | null
}

export interface DadosFoto {
  legenda: string
  turma: string
  ano: number | null
  idEvento: number | null
}

const traducoes: [string, string][] = [
  ['row-level security', 'Você não tem permissão para fazer isso.'],
  ['violates check constraint', 'Legenda, turma ou ano fora do permitido.'],
  ['Failed to fetch', 'Sem conexão com a internet.'],
  ['NetworkError', 'Sem conexão com a internet.']
]

function traduzirErro(mensagem: string): string {
  const achado = traducoes.find(([chave]) =>
    mensagem.toLowerCase().includes(chave.toLowerCase())
  )
  return achado ? achado[1] : `Não foi possível concluir: ${mensagem}`
}

export async function listarFotos(limite = 60): Promise<FotoGaleria[]> {
  const { data, error } = await supabase
    .from('galeria')
    .select(
      'id, caminho, legenda, turma, ano, data, id_usuario, perfil(nome), evento(nome)'
    )
    .order('data', { ascending: false })
    .limit(limite)
  if (error) throw new Error(traduzirErro(error.message))
  return (data ?? []) as unknown as FotoGaleria[]
}

export async function enviarFoto(
  idUsuario: string,
  dataUrl: string,
  dados: DadosFoto
): Promise<void> {
  const caminho = await enviarImagem('galeria', idUsuario, dataUrl)

  const { error } = await supabase.from('galeria').insert({
    id_usuario: idUsuario,
    id_evento: dados.idEvento,
    caminho,
    legenda: dados.legenda.trim() || null,
    turma: dados.turma.trim() || null,
    ano: dados.ano
  })

  if (error) {
    await removerImagens('galeria', [caminho])
    throw new Error(traduzirErro(error.message))
  }
}

export async function removerFoto(foto: FotoGaleria): Promise<void> {
  const { data, error } = await supabase
    .from('galeria')
    .delete()
    .eq('id', foto.id)
    .select('id')
  if (error) throw new Error(traduzirErro(error.message))
  if (!data?.length) {
    throw new Error('Você não pode apagar essa foto.')
  }
  await removerImagens('galeria', [foto.caminho])
}
