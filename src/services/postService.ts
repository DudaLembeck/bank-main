import { supabase } from './supabase'
import { enviarImagem, removerImagens } from './imagemService'

export interface PostImagem {
  caminho: string
  ordem: number
}

export interface Post {
  id: number
  texto: string
  data: string
  id_usuario: string
  perfil: { nome: string } | null
  evento: { nome: string } | null
  post_imagem: PostImagem[]
}

const traducoes: [string, string][] = [
  ['row-level security', 'Você não tem permissão para fazer isso.'],
  ['violates check constraint', 'O texto do post está fora do permitido.'],
  ['Failed to fetch', 'Sem conexão com a internet.'],
  ['NetworkError', 'Sem conexão com a internet.']
]

function traduzirErro(mensagem: string): string {
  const achado = traducoes.find(([chave]) =>
    mensagem.toLowerCase().includes(chave.toLowerCase())
  )
  return achado ? achado[1] : `Não foi possível concluir: ${mensagem}`
}

export async function listarPosts(limite = 30): Promise<Post[]> {
  const { data, error } = await supabase
    .from('post')
    .select(
      'id, texto, data, id_usuario, perfil(nome), evento(nome), post_imagem(caminho, ordem)'
    )
    .order('data', { ascending: false })
    .limit(limite)
  if (error) throw new Error(traduzirErro(error.message))

  const posts = (data ?? []) as unknown as Post[]
  posts.forEach((p) => p.post_imagem.sort((a, b) => a.ordem - b.ordem))
  return posts
}

export async function publicarPost(
  idUsuario: string,
  texto: string,
  fotos: string[],
  idEvento: number | null
): Promise<void> {
  const caminhos: string[] = []

  try {
    for (const foto of fotos) {
      caminhos.push(await enviarImagem('posts', idUsuario, foto))
    }
  } catch (e) {
    await removerImagens('posts', caminhos)
    throw e
  }

  const { data: post, error: erroPost } = await supabase
    .from('post')
    .insert({
      id_usuario: idUsuario,
      texto: texto.trim(),
      id_evento: idEvento
    })
    .select('id')
    .single()

  if (erroPost || !post) {
    await removerImagens('posts', caminhos)
    throw new Error(traduzirErro(erroPost?.message ?? 'post não criado'))
  }

  if (!caminhos.length) return

  const { error: erroImagens } = await supabase.from('post_imagem').insert(
    caminhos.map((caminho, ordem) => ({
      id_post: post.id,
      caminho,
      ordem
    }))
  )

  if (erroImagens) {
    await supabase.from('post').delete().eq('id', post.id)
    await removerImagens('posts', caminhos)
    throw new Error(traduzirErro(erroImagens.message))
  }
}

export async function removerPost(post: Post): Promise<void> {
  const { data, error } = await supabase
    .from('post')
    .delete()
    .eq('id', post.id)
    .select('id')
  if (error) throw new Error(traduzirErro(error.message))
  if (!data?.length) {
    throw new Error('Você não pode apagar esse post.')
  }
  await removerImagens(
    'posts',
    post.post_imagem.map((i) => i.caminho)
  )
}
