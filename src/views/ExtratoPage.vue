<template>
  <ion-page>
    <CabecalhoApp />

    <ion-content :fullscreen="true" class="fundo">
      <PilulasNavegacao grupo="simples" />
      <TituloSecao texto="Extrato" />

      <div class="cartao-saldo">
        <span class="rotulo">Saldo</span>
        <strong>{{ formatarReal(caixa.saldoCentavos) }}</strong>
      </div>

      <ion-button fill="clear" size="small" class="link-eventos" router-link="/eventos">
        ver dias D e eventos
      </ion-button>

      <div v-if="usuario.ehComissao" class="acoes-caixa">
        <ion-button class="botao-adicionar" @click="abrirLancamento('entrada')">
          <ion-icon slot="start" :icon="addCircleOutline" />
          ADICIONAR
        </ion-button>
        <ion-button class="botao-retirar" @click="abrirLancamento('saida')">
          <ion-icon slot="start" :icon="removeCircleOutline" />
          RETIRAR
        </ion-button>
      </div>

      <div class="lista">
        <h3>Extrato bancário</h3>

        <div v-if="caixa.carregando" class="centro">
          <ion-spinner name="dots" />
        </div>

        <div v-else-if="caixa.erro" class="centro">
          <p class="erro">{{ caixa.erro }}</p>
          <ion-button fill="clear" size="small" @click="caixa.carregarExtrato()">
            tentar de novo
          </ion-button>
        </div>

        <p v-else-if="!caixa.movimentacoes.length" class="vazio">
          Nenhuma movimentação ainda.
        </p>

        <ion-list v-else lines="none">
          <ion-item v-for="m in caixa.movimentacoes" :key="m.id">
            <ion-label>
              <h2 :class="m.tipo">{{ formatarComSinal(m.valor_centavos, m.tipo) }}</h2>
              <p>{{ m.descricao }}</p>
              <p v-if="m.evento" class="evento">{{ m.evento.nome }}</p>
              <p v-if="m.perfil" class="autor">por {{ m.perfil.nome }}</p>
            </ion-label>
            <ion-note slot="end">{{ formatarData(m.data) }}</ion-note>
          </ion-item>
        </ion-list>
      </div>

      <div class="ancora-modal">
      <ion-modal :is-open="modalAberto" @did-dismiss="fecharLancamento">
        <ion-content class="fundo">
          <TituloSecao
            :texto="tipo === 'entrada' ? 'Adicionar ao caixa' : 'Retirar do caixa'"
          />

          <p class="disponivel">
            Saldo atual: <strong>{{ formatarReal(caixa.saldoCentavos) }}</strong>
          </p>

          <CartaoFormulario
            :titulo="tipo === 'entrada' ? 'DADOS DA ENTRADA' : 'DADOS DA RETIRADA'"
          >
            <ion-list lines="none">
              <ion-item>
                <ion-input
                  v-model="valor"
                  label="valor (R$)"
                  label-placement="floating"
                  inputmode="decimal"
                  placeholder="0,00"
                  :error-text="erroValor"
                  :class="{ 'ion-invalid ion-touched': tocado && erroValor }"
                />
              </ion-item>
              <ion-item>
                <ion-select
                  v-model="idEvento"
                  label="evento (opcional)"
                  label-placement="floating"
                  interface="action-sheet"
                  cancel-text="Cancelar"
                >
                  <ion-select-option :value="null">Nenhum</ion-select-option>
                  <ion-select-option
                    v-for="e in eventosAbertos"
                    :key="e.id"
                    :value="e.id"
                  >
                    {{ e.nome }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-input
                  v-model="descricao"
                  label="motivo"
                  label-placement="floating"
                  :maxlength="200"
                  :error-text="erroDescricao"
                  :class="{ 'ion-invalid ion-touched': tocado && erroDescricao }"
                />
              </ion-item>
            </ion-list>

            <p v-if="erroGeral" class="erro">{{ erroGeral }}</p>

            <ion-button
              expand="block"
              fill="clear"
              :disabled="salvando"
              @click="confirmar"
            >
              <ion-spinner v-if="salvando" name="dots" />
              <span v-else>CONFIRMAR</span>
            </ion-button>

            <ion-button expand="block" fill="clear" @click="fecharLancamento">
              cancelar
            </ion-button>
          </CartaoFormulario>
        </ion-content>
      </ion-modal>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  alertController
} from '@ionic/vue'
import { addCircleOutline, removeCircleOutline } from 'ionicons/icons'
import CabecalhoApp from '../components/CabecalhoApp.vue'
import CartaoFormulario from '../components/CartaoFormulario.vue'
import PilulasNavegacao from '../components/PilulasNavegacao.vue'
import TituloSecao from '../components/TituloSecao.vue'
import { useCaixaStore } from '../stores/caixa'
import { useUsuarioStore } from '../stores/usuario'
import { listarEventos, type Evento } from '../services/eventoService'
import {
  formatarComSinal,
  formatarData,
  formatarReal,
  paraCentavos
} from '../services/dinheiro'

const caixa = useCaixaStore()
const usuario = useUsuarioStore()

const modalAberto = ref(false)
const tipo = ref<'entrada' | 'saida'>('entrada')
const valor = ref('')
const descricao = ref('')
const tocado = ref(false)
const salvando = ref(false)
const erroGeral = ref('')
const idEvento = ref<number | null>(null)
const eventos = ref<Evento[]>([])

const eventosAbertos = computed(() => eventos.value.filter((e) => !e.encerrado))
const centavos = computed(() => paraCentavos(valor.value))

const erroValor = computed(() => {
  if (!valor.value.trim()) return 'Informe o valor.'
  if (centavos.value <= 0) return 'O valor precisa ser maior que zero.'
  if (centavos.value > 100000000) return 'Valor acima do limite.'
  if (tipo.value === 'saida' && centavos.value > caixa.saldoCentavos) {
    return 'O caixa só tem ' + formatarReal(caixa.saldoCentavos) + '.'
  }
  return ''
})

const erroDescricao = computed(() => {
  const texto = descricao.value.trim()
  if (texto.length < 3) return 'Explique o motivo (mínimo 3 letras).'
  if (texto.length > 200) return 'Use no máximo 200 caracteres.'
  return ''
})

const formularioValido = computed(() => !erroValor.value && !erroDescricao.value)

onIonViewWillEnter(async () => {
  caixa.carregarExtrato()
  try {
    eventos.value = await listarEventos()
  } catch {
    eventos.value = []
  }
})

function abrirLancamento(tipoEscolhido: 'entrada' | 'saida') {
  tipo.value = tipoEscolhido
  valor.value = ''
  descricao.value = ''
  idEvento.value = null
  tocado.value = false
  erroGeral.value = ''
  modalAberto.value = true
}

function fecharLancamento() {
  modalAberto.value = false
}

async function confirmar() {
  tocado.value = true
  erroGeral.value = ''
  if (!formularioValido.value) return

  const resumo =
    (tipo.value === 'entrada' ? 'Adição de ' : 'Retirada de ') +
    formatarReal(centavos.value) +
    ' — ' +
    descricao.value.trim()

  const confirmacao = await alertController.create({
    header: 'Confirmar lançamento',
    message: resumo,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      { text: 'Confirmar', role: 'confirm' }
    ]
  })
  await confirmacao.present()
  const { role } = await confirmacao.onDidDismiss()
  if (role !== 'confirm') return

  salvando.value = true
  try {
    await caixa.lancar(
      tipo.value,
      centavos.value,
      descricao.value,
      idEvento.value ?? undefined
    )
    modalAberto.value = false
  } catch (e: unknown) {
    erroGeral.value =
      e instanceof Error ? e.message : 'Não foi possível lançar.'
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.fundo {
  --background: rgb(248, 239, 243);
}

.cartao-saldo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 0 16px;
  padding: 20px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(155, 34, 98, 0.12);
}

.rotulo {
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #9a9a9a;
}

.cartao-saldo strong {
  font-size: 26px;
  color: var(--ion-color-tertiary);
}

.link-eventos {
  display: block;
  margin: 4px 16px 0;
  --color: var(--ion-color-tertiary);
  font-size: 12px;
}

.acoes-caixa {
  display: flex;
  gap: 10px;
  margin: 16px;
}

.acoes-caixa ion-button {
  flex: 1;
  margin: 0;
  --border-radius: 14px;
  font-weight: 700;
  letter-spacing: 1px;
}

.botao-adicionar {
  --background: var(--ion-color-success-shade);
}

.botao-retirar {
  --background: var(--ion-color-danger);
}

.disponivel {
  margin: 0 16px 4px;
  text-align: center;
  font-size: 13px;
  color: #6b6868;
}

.disponivel strong {
  color: var(--ion-color-tertiary);
}

.lista {
  margin: 8px 16px 32px;
  padding: 18px 14px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(155, 34, 98, 0.12);
}

.lista h3 {
  margin: 0 0 10px 4px;
  font-size: 15px;
  color: var(--ion-color-tertiary);
}

ion-list {
  background: transparent;
  padding: 0;
}

ion-item {
  --background: rgba(251, 183, 219, 0.18);
  --border-radius: 12px;
  --padding-start: 12px;
  margin-bottom: 8px;
}

ion-item h2 {
  font-size: 15px;
  font-weight: 700;
}

ion-item h2.entrada {
  color: var(--ion-color-success-shade);
}

ion-item h2.saida {
  color: var(--ion-color-danger);
}

ion-item p {
  font-size: 12px;
  color: #6b6868;
}

ion-item p.evento {
  font-weight: 600;
  color: var(--ion-color-tertiary);
}

ion-item p.autor {
  color: #9a9a9a;
}

ion-note {
  font-size: 11px;
}

.centro {
  text-align: center;
  padding: 16px;
}

.vazio {
  text-align: center;
  font-size: 13px;
  color: #9a9a9a;
  padding: 12px;
}

.erro {
  font-size: 13px;
  text-align: center;
  color: var(--ion-color-danger);
}

ion-modal ion-button {
  --color: var(--ion-color-tertiary);
  font-weight: 700;
  letter-spacing: 1px;
}
</style>
