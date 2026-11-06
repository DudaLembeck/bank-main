import { ref } from 'vue'
import { alertController, toastController } from '@ionic/vue'
import { curtir, descurtir } from '../services/curtidaService'
import { listarPosts, removerPost, type Post } from '../services/postService'
import { useUsuarioStore } from '../stores/usuario'

export function useFeed(limite: number) {
  const usuario = useUsuarioStore()

  const posts = ref<Post[]>([])
  const carregando = ref(true)
  const erro = ref('')

  async function avisarErro(e: unknown, padrao: string) {
    const aviso = await toastController.create({
      message: e instanceof Error ? e.message : padrao,
      duration: 2500,
      color: 'danger'
    })
    await aviso.present()
  }

  async function carregar() {
    erro.value = ''
    try {
      posts.value = await listarPosts(usuario.perfil?.id ?? null, limite)
    } catch (e: unknown) {
      erro.value = e instanceof Error ? e.message : 'Erro ao carregar os posts.'
    } finally {
      carregando.value = false
    }
  }

  function podeApagar(post: Post): boolean {
    return post.id_usuario === usuario.perfil?.id || usuario.ehComissao
  }

  async function alternarCurtida(post: Post) {
    const idUsuario = usuario.perfil?.id
    if (!idUsuario) return

    const antes = { curti: post.curti, curtidas: post.curtidas }
    post.curti = !antes.curti
    post.curtidas = antes.curtidas + (post.curti ? 1 : -1)

    try {
      if (post.curti) {
        await curtir(idUsuario, 'post', post.id)
      } else {
        await descurtir(idUsuario, 'post', post.id)
      }
    } catch (e: unknown) {
      post.curti = antes.curti
      post.curtidas = antes.curtidas
      await avisarErro(e, 'Não foi possível curtir.')
    }
  }

  async function confirmarRemocao(post: Post) {
    const alerta = await alertController.create({
      header: 'Apagar post?',
      cssClass: 'alerta-perigo',
      message: 'Essa ação não pode ser desfeita.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Apagar', role: 'confirm' }
      ]
    })
    await alerta.present()
    const { role } = await alerta.onDidDismiss()
    if (role !== 'confirm') return

    try {
      await removerPost(post)
      await carregar()
    } catch (e: unknown) {
      await avisarErro(e, 'Não foi possível apagar.')
    }
  }

  return {
    posts,
    carregando,
    erro,
    carregar,
    podeApagar,
    alternarCurtida,
    confirmarRemocao
  }
}
