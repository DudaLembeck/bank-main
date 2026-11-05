import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface Perfil {
  id: string
  nome_usuario: string
  nome: string
  is_admin: boolean
  foto_perfil: string | null
  criado_em: string
}

const traducoes: [string, string][] = [
  ['Invalid login credentials', 'E-mail ou senha incorretos.'],
  ['Email not confirmed', 'Confirme seu e-mail antes de entrar.'],
  ['User already registered', 'Já existe uma conta com esse e-mail.'],
  ['already registered', 'Já existe uma conta com esse e-mail.'],
  ['Password should be at least', 'A senha precisa ter pelo menos 6 caracteres.'],
  ['Unable to validate email address', 'E-mail inválido.'],
  ['Database error saving new user', 'Já existe uma conta com esse nome completo.'],
  ['duplicate key value', 'Já existe uma conta com esse nome completo.'],
  ['Failed to fetch', 'Sem conexão com a internet.'],
  ['NetworkError', 'Sem conexão com a internet.'],
  ['over_email_send_rate_limit', 'Muitas tentativas. Espere alguns minutos.'],
  ['Token has expired or is invalid', 'Código inválido ou expirado.'],
  ['otp_expired', 'Código inválido ou expirado.'],
  ['New password should be different', 'A nova senha precisa ser diferente da atual.'],
  ['you can only request this after', 'Aguarde alguns segundos antes de pedir outro código.'],
  ['email rate limit exceeded', 'Limite de e-mails atingido. Tente de novo mais tarde.'],
  ['Error sending recovery email', 'Não foi possível enviar o e-mail. Confira a configuração de e-mail do projeto.']
]

function traduzirErro(mensagem: string): string {
  const achado = traducoes.find(([chave]) =>
    mensagem.toLowerCase().includes(chave.toLowerCase())
  )
  return achado ? achado[1] : `Não foi possível concluir: ${mensagem}`
}

export async function entrar(email: string, senha: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: senha
  })
  if (error) throw new Error(traduzirErro(error.message))
  return data.session
}

export async function cadastrar(
  nomeCompleto: string,
  email: string,
  senha: string,
  codigoComissao?: string
): Promise<Session | null> {
  const nome = nomeCompleto.trim().replace(/\s+/g, ' ')
  const codigo = codigoComissao?.trim() ?? ''
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password: senha,
    options: {
      data: codigo
        ? { nome_usuario: nome, nome, codigo_comissao: codigo }
        : { nome_usuario: nome, nome }
    }
  })
  if (error) throw new Error(traduzirErro(error.message))
  return data.session
}

export async function sair(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(traduzirErro(error.message))
}

export async function buscarSessao(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(traduzirErro(error.message))
  return data.session
}

export async function buscarPerfil(id: string): Promise<Perfil> {
  const { data, error } = await supabase
    .from('perfil')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(traduzirErro(error.message))
  return data as Perfil
}

export function observarSessao(aoMudar: (sessao: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => {
    aoMudar(sessao)
  })
  return () => data.subscription.unsubscribe()
}

export async function pedirCodigoRecuperacao(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim())
  if (error) throw new Error(traduzirErro(error.message))
}

export async function redefinirSenha(
  email: string,
  codigo: string,
  novaSenha: string
): Promise<void> {
  const { error: erroCodigo } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: codigo.trim(),
    type: 'recovery'
  })
  if (erroCodigo) throw new Error(traduzirErro(erroCodigo.message))

  const { error } = await supabase.auth.updateUser({ password: novaSenha })
  if (error) throw new Error(traduzirErro(error.message))
}
