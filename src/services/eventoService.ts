import { supabase } from './supabase'

export interface Evento {
  id: number
  nome: string
  tipo: 'dia_d' | 'outro'
  data_evento: string | null
  descricao: string | null
  encerrado: boolean
}

const traducoes: [string, string][] = [
  ['permission denied', 'Só a comissão pode mexer nos eventos.'],
  ['new row violates row-level security',
   'Só a comissão pode cadastrar eventos.'],
  ['violates check constraint', 'Dados do evento fora do permitido.'],
  ['Failed to fetch', 'Sem conexão com a internet.'],
  ['NetworkError', 'Sem conexão com a internet.']
]

function traduzirErro(mensagem: string): string {
  const achado = traducoes.find(([chave]) =>
    mensagem.toLowerCase().includes(chave.toLowerCase())
  )
  return achado ? achado[1] : `Não foi possível concluir: ${mensagem}`
}

export async function listarEventos(): Promise<Evento[]> {
  const { data, error } = await supabase
    .from('evento')
    .select('id, nome, tipo, data_evento, descricao, encerrado')
    .order('encerrado', { ascending: true })
    .order('data_evento', { ascending: false, nullsFirst: false })
  if (error) throw new Error(traduzirErro(error.message))
  return (data ?? []) as Evento[]
}

export async function criarEvento(
  nome: string,
  tipo: 'dia_d' | 'outro',
  dataEvento: string | null,
  descricao: string | null
): Promise<void> {
  const { error } = await supabase.from('evento').insert({
    nome: nome.trim(),
    tipo,
    data_evento: dataEvento || null,
    descricao: descricao?.trim() || null
  })
  if (error) throw new Error(traduzirErro(error.message))
}

export async function alternarEncerrado(
  id: number,
  encerrado: boolean
): Promise<void> {
  const { error } = await supabase
    .from('evento')
    .update({ encerrado })
    .eq('id', id)
  if (error) throw new Error(traduzirErro(error.message))
}
