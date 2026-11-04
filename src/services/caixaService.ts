import { supabase } from './supabase'

export interface Movimentacao {
  id: number
  tipo: 'entrada' | 'saida'
  valor_centavos: number
  descricao: string
  saldo_apos_centavos: number
  data: string
  perfil: { nome: string } | null
  evento: { nome: string } | null
}

const traducoes: [string, string][] = [
  ['apenas a comissao pode movimentar o caixa',
   'Só a comissão pode movimentar o caixa.'],
  ['saldo_centavos_check',
   'O caixa não tem esse valor disponível.'],
  ['violates check constraint',
   'Valor ou descrição fora do permitido.'],
  ['Failed to fetch', 'Sem conexão com a internet.'],
  ['NetworkError', 'Sem conexão com a internet.'],
  ['permission denied', 'Você não tem permissão para isso.']
]

function traduzirErro(mensagem: string): string {
  const achado = traducoes.find(([chave]) =>
    mensagem.toLowerCase().includes(chave.toLowerCase())
  )
  return achado ? achado[1] : `Não foi possível concluir: ${mensagem}`
}

export async function buscarSaldo(): Promise<number> {
  const { data, error } = await supabase
    .from('caixa')
    .select('saldo_centavos')
    .eq('id', 1)
    .single()
  if (error) throw new Error(traduzirErro(error.message))
  return data.saldo_centavos as number
}

export async function listarMovimentacoes(limite = 50): Promise<Movimentacao[]> {
  const { data, error } = await supabase
    .from('movimentacao')
    .select('id, tipo, valor_centavos, descricao, saldo_apos_centavos, data, perfil(nome), evento(nome)')
    .order('data', { ascending: false })
    .limit(limite)
  if (error) throw new Error(traduzirErro(error.message))
  return (data ?? []) as unknown as Movimentacao[]
}

export async function registrarMovimentacao(
  tipo: 'entrada' | 'saida',
  valorCentavos: number,
  descricao: string,
  idEvento?: number
): Promise<void> {
  const { error } = await supabase.rpc('registrar_movimentacao', {
    p_tipo: tipo,
    p_valor_centavos: valorCentavos,
    p_descricao: descricao.trim(),
    p_id_evento: idEvento ?? null
  })
  if (error) throw new Error(traduzirErro(error.message))
}
