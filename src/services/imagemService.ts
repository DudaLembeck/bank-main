import { supabase } from './supabase'

export type BucketImagem = 'perfis' | 'posts' | 'galeria'

const traducoes: [string, string][] = [
  ['Bucket not found', 'O espaço de fotos não existe no servidor.'],
  ['row-level security', 'Você não tem permissão para enviar fotos.'],
  ['exceeded the maximum allowed size', 'A foto é grande demais.'],
  ['Failed to fetch', 'Sem conexão com a internet.'],
  ['NetworkError', 'Sem conexão com a internet.']
]

function traduzirErro(mensagem: string): string {
  const achado = traducoes.find(([chave]) =>
    mensagem.toLowerCase().includes(chave.toLowerCase())
  )
  return achado ? achado[1] : `Não foi possível enviar a foto: ${mensagem}`
}

async function dataUrlParaBlob(dataUrl: string): Promise<Blob> {
  const resposta = await fetch(dataUrl)
  return resposta.blob()
}

export async function enviarImagem(
  bucket: BucketImagem,
  idUsuario: string,
  dataUrl: string
): Promise<string> {
  const blob = await dataUrlParaBlob(dataUrl)
  const extensao = blob.type === 'image/png' ? 'png' : 'jpg'
  const sufixo = Math.random().toString(36).slice(2, 8)
  const caminho = `${idUsuario}/${Date.now()}-${sufixo}.${extensao}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(caminho, blob, { contentType: blob.type || 'image/jpeg' })
  if (error) throw new Error(traduzirErro(error.message))
  return caminho
}

export function urlPublica(bucket: BucketImagem, caminho: string): string {
  return supabase.storage.from(bucket).getPublicUrl(caminho).data.publicUrl
}

export async function removerImagens(
  bucket: BucketImagem,
  caminhos: string[]
): Promise<void> {
  if (!caminhos.length) return
  await supabase.storage.from(bucket).remove(caminhos)
}
