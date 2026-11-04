import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  buscarSaldo,
  listarMovimentacoes,
  registrarMovimentacao,
  type Movimentacao
} from '../services/caixaService'

export const useCaixaStore = defineStore('caixa', () => {
  const saldoCentavos = ref(0)
  const movimentacoes = ref<Movimentacao[]>([])
  const carregando = ref(false)
  const erro = ref('')

  async function carregarSaldo() {
    try {
      saldoCentavos.value = await buscarSaldo()
      erro.value = ''
    } catch (e: unknown) {
      erro.value = e instanceof Error ? e.message : 'Erro ao buscar o saldo.'
    }
  }

  async function carregarExtrato() {
    carregando.value = true
    erro.value = ''
    try {
      const [saldo, lista] = await Promise.all([
        buscarSaldo(),
        listarMovimentacoes()
      ])
      saldoCentavos.value = saldo
      movimentacoes.value = lista
    } catch (e: unknown) {
      erro.value = e instanceof Error ? e.message : 'Erro ao carregar o extrato.'
    } finally {
      carregando.value = false
    }
  }

  async function lancar(
    tipo: 'entrada' | 'saida',
    valorCentavos: number,
    descricao: string,
    idEvento?: number
  ) {
    await registrarMovimentacao(tipo, valorCentavos, descricao, idEvento)
    await carregarExtrato()
  }

  return {
    saldoCentavos,
    movimentacoes,
    carregando,
    erro,
    carregarSaldo,
    carregarExtrato,
    lancar
  }
})
