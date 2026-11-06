import { supabase } from './supabase'
import { enviarImagem, removerImagens } from './imagemService'

const traducoes: [string, string][] = [
  ['row-level security', 'Você não tem permissão para alterar o perfil.'],
  ['permission denied', 'Você não tem permissão para alterar o perfil.'],
  ['Failed to fetch', 'Sem conexão com a internet.'],
  ['NetworkError', 'Sem conexão com a internet.']
]

function traduzirErro(mensagem: string): string {
  const achado = traducoes.find(([chave]) =>
    mensagem.toLowerCase().includes(chave.toLowerCase())
  )
  return achado ? achado[1] : `Não foi possível concluir: ${mensagem}`
}

export async function atualizarFotoPerfil(
  idUsuario: string,
  dataUrl: string,
  caminhoAntigo: string | null
): Promise<void> {
  const caminho = await enviarImagem('perfis', idUsuario, dataUrl)

  const { data, error } = await supabase
    .from('perfil')
    .update({ foto_perfil: caminho })
    .eq('id', idUsuario)
    .select('id')

  if (error || !data?.length) {
    await removerImagens('perfis', [caminho])
    throw new Error(
      error ? traduzirErro(error.message) : 'Não foi possível salvar a foto.'
    )
  }

  if (caminhoAntigo) {
    await removerImagens('perfis', [caminhoAntigo])
  }
}
