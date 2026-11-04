import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Session } from '@supabase/supabase-js'
import {
  buscarPerfil,
  buscarSessao,
  cadastrar as cadastrarNoSupabase,
  entrar as entrarNoSupabase,
  observarSessao,
  sair as sairDoSupabase,
  type Perfil
} from '../services/authService'

export const useUsuarioStore = defineStore('usuario', () => {
  const perfil = ref<Perfil | null>(null)
  const temSessao = ref(false)
  const iniciando = ref(true)

  const logado = computed(() => temSessao.value)
  const ehComissao = computed(() => perfil.value?.is_admin === true)
  const nomeExibicao = computed(() => perfil.value?.nome ?? '')
  const nomeUsuario = computed(() => perfil.value?.nome_usuario ?? '')

  async function aplicarSessao(sessao: Session | null) {
    temSessao.value = sessao !== null
    if (!sessao) {
      perfil.value = null
      return
    }
    try {
      perfil.value = await buscarPerfil(sessao.user.id)
    } catch {
      perfil.value = null
    }
  }

  async function inicializar() {
    try {
      await aplicarSessao(await buscarSessao())
      observarSessao((sessao) => {
        void aplicarSessao(sessao)
      })
    } finally {
      iniciando.value = false
    }
  }

  async function entrar(email: string, senha: string) {
    const sessao = await entrarNoSupabase(email, senha)
    await aplicarSessao(sessao)
  }

  async function cadastrar(
    nomeCompleto: string,
    email: string,
    senha: string,
    codigoComissao?: string
  ) {
    const sessao = await cadastrarNoSupabase(
      nomeCompleto,
      email,
      senha,
      codigoComissao
    )
    await aplicarSessao(sessao)
    return { entrouDireto: sessao !== null, virouComissao: ehComissao.value }
  }

  async function sair() {
    await sairDoSupabase()
    await aplicarSessao(null)
  }

  return {
    perfil,
    iniciando,
    logado,
    ehComissao,
    nomeExibicao,
    nomeUsuario,
    inicializar,
    entrar,
    cadastrar,
    sair
  }
})
