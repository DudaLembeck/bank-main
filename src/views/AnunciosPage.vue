<template>
  <ion-page>
    <CabecalhoApp />

    <ion-content :fullscreen="true" class="fundo">
      <PilulasNavegacao grupo="anuncios" />
      <TituloSecao texto="Anúncios" />

      <ion-button
        v-if="usuario.ehComissao"
        expand="block"
        class="botao-novo"
        @click="abrirNovo"
      >
        <ion-icon slot="start" :icon="megaphoneOutline" />
        NOVO ANÚNCIO
      </ion-button>

      <div v-if="carregando" class="centro">
        <ion-spinner name="dots" />
      </div>

      <div v-else-if="erroLista" class="centro">
        <p class="erro">{{ erroLista }}</p>
        <ion-button fill="clear" size="small" @click="carregar">
          tentar de novo
        </ion-button>
      </div>

      <template v-else>
        <ion-card
          v-for="anuncio in anuncios"
          :key="anuncio.id"
          class="anuncio"
          :class="{ fixado: anuncio.fixado }"
        >
          <ion-card-content>
            <div class="topo">
              <div>
                <ion-icon v-if="anuncio.fixado" :icon="pin" class="icone-fixado" />
                <strong class="autor">{{ anuncio.perfil?.nome ?? 'Comissão' }}</strong>
                <span class="data">{{ formatarDataHora(anuncio.data) }}</span>
              </div>

              <div v-if="usuario.ehComissao" class="acoes">
                <ion-button fill="clear" size="small" @click="alternar(anuncio)">
                  <ion-icon
                    slot="icon-only"
                    :icon="anuncio.fixado ? pin : pinOutline"
                  />
                </ion-button>
                <ion-button
                  fill="clear"
                  size="small"
                  color="danger"
                  @click="confirmarRemocao(anuncio)"
                >
                  <ion-icon slot="icon-only" :icon="trashOutline" />
                </ion-button>
              </div>
            </div>

            <ion-chip v-if="anuncio.evento" color="tertiary" class="chip-evento">
              <ion-label>{{ anuncio.evento.nome }}</ion-label>
            </ion-chip>

            <p class="texto">{{ anuncio.texto }}</p>
          </ion-card-content>
        </ion-card>

        <p class="fim">
          {{ anuncios.length ? 'sem novos anúncios' : 'Nenhum anúncio ainda.' }}
        </p>
      </template>

      <ion-modal :is-open="modalAberto" @did-dismiss="fecharNovo">
        <ion-content class="fundo">
          <TituloSecao texto="Novo anúncio" />

          <CartaoFormulario titulo="AVISO PARA A TURMA">
            <ion-list lines="none">
              <ion-item>
                <ion-textarea
                  v-model="texto"
                  label="aviso"
                  label-placement="floating"
                  :auto-grow="true"
                  :rows="4"
                  :maxlength="500"
                  :counter="true"
                  :error-text="erroTexto"
                  :class="{ 'ion-invalid ion-touched': tocado && erroTexto }"
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
                    v-for="e in eventos"
                    :key="e.id"
                    :value="e.id"
                  >
                    {{ e.nome }}
                  </ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-toggle v-model="fixar" label-placement="start">
                  Fixar no topo
                </ion-toggle>
              </ion-item>
            </ion-list>

            <p v-if="erroGeral" class="erro">{{ erroGeral }}</p>

            <ion-button
              expand="block"
              fill="clear"
              :disabled="publicando"
              @click="publicar"
            >
              <ion-spinner v-if="publicando" name="dots" />
              <span v-else>PUBLICAR</span>
            </ion-button>

            <ion-button
              expand="block"
              fill="clear"
              :disabled="publicando"
              @click="fecharNovo"
            >
              cancelar
            </ion-button>
          </CartaoFormulario>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonToggle,
  alertController,
  toastController
} from '@ionic/vue'
import {
  megaphoneOutline,
  pin,
  pinOutline,
  trashOutline
} from 'ionicons/icons'
import CabecalhoApp from '../components/CabecalhoApp.vue'
import CartaoFormulario from '../components/CartaoFormulario.vue'
import PilulasNavegacao from '../components/PilulasNavegacao.vue'
import TituloSecao from '../components/TituloSecao.vue'
import {
  alternarFixado,
  listarAnuncios,
  publicarAnuncio,
  removerAnuncio,
  type Anuncio
} from '../services/anuncioService'
import { formatarDataHora } from '../services/data'
import { listarEventos, type Evento } from '../services/eventoService'
import { useUsuarioStore } from '../stores/usuario'

const usuario = useUsuarioStore()

const anuncios = ref<Anuncio[]>([])
const eventos = ref<Evento[]>([])
const carregando = ref(true)
const erroLista = ref('')

const modalAberto = ref(false)
const texto = ref('')
const idEvento = ref<number | null>(null)
const fixar = ref(false)
const tocado = ref(false)
const publicando = ref(false)
const erroGeral = ref('')

const erroTexto = computed(() => {
  const valor = texto.value.trim()
  if (!valor) return 'Escreva o aviso.'
  if (valor.length > 500) return 'Use no máximo 500 caracteres.'
  return ''
})

async function carregar() {
  carregando.value = true
  erroLista.value = ''
  try {
    anuncios.value = await listarAnuncios()
  } catch (e: unknown) {
    erroLista.value =
      e instanceof Error ? e.message : 'Erro ao carregar os anúncios.'
  } finally {
    carregando.value = false
  }
}

onMounted(async () => {
  carregar()
  if (!usuario.ehComissao) return
  try {
    eventos.value = (await listarEventos()).filter((e) => !e.encerrado)
  } catch {
    eventos.value = []
  }
})

function abrirNovo() {
  texto.value = ''
  idEvento.value = null
  fixar.value = false
  tocado.value = false
  erroGeral.value = ''
  modalAberto.value = true
}

function fecharNovo() {
  modalAberto.value = false
}

async function avisarErro(e: unknown, padrao: string) {
  const aviso = await toastController.create({
    message: e instanceof Error ? e.message : padrao,
    duration: 2500,
    color: 'danger'
  })
  await aviso.present()
}

async function publicar() {
  tocado.value = true
  erroGeral.value = ''
  if (erroTexto.value || !usuario.perfil) return

  publicando.value = true
  try {
    await publicarAnuncio(
      usuario.perfil.id,
      texto.value,
      idEvento.value,
      fixar.value
    )
    modalAberto.value = false
    await carregar()
    const aviso = await toastController.create({
      message: 'Anúncio publicado.',
      duration: 2000,
      color: 'success'
    })
    await aviso.present()
  } catch (e: unknown) {
    erroGeral.value =
      e instanceof Error ? e.message : 'Não foi possível publicar.'
  } finally {
    publicando.value = false
  }
}

async function alternar(anuncio: Anuncio) {
  try {
    await alternarFixado(anuncio.id, !anuncio.fixado)
    await carregar()
  } catch (e: unknown) {
    await avisarErro(e, 'Não foi possível fixar.')
  }
}

async function confirmarRemocao(anuncio: Anuncio) {
  const alerta = await alertController.create({
    header: 'Apagar anúncio?',
    message: 'Os alunos deixam de ver esse aviso.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      { text: 'Apagar', role: 'confirm' }
    ]
  })
  await alerta.present()
  const { role } = await alerta.onDidDismiss()
  if (role !== 'confirm') return

  try {
    await removerAnuncio(anuncio.id)
    await carregar()
  } catch (e: unknown) {
    await avisarErro(e, 'Não foi possível apagar.')
  }
}
</script>

<style scoped>
.fundo {
  --background: rgb(248, 239, 243);
}

.botao-novo {
  margin: 16px;
  --background: var(--ion-color-tertiary);
  --border-radius: 14px;
  font-weight: 700;
  letter-spacing: 1px;
}

.anuncio {
  margin: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 5px 16px rgba(155, 34, 98, 0.12);
}

.anuncio.fixado {
  border: 1.5px solid var(--ion-color-primary);
}

.topo {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.icone-fixado {
  margin-right: 4px;
  vertical-align: -2px;
  color: var(--ion-color-tertiary);
}

.autor {
  font-size: 14px;
  color: var(--ion-color-tertiary);
}

.data {
  display: block;
  font-size: 11px;
  color: #9a9a9a;
}

.acoes {
  display: flex;
  flex-shrink: 0;
}

.acoes ion-button:not([color]) {
  --color: var(--ion-color-tertiary);
}

.chip-evento {
  margin: 6px 0 0;
  font-size: 11px;
  height: 24px;
}

.texto {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 20px;
  color: #4a4a4a;
  white-space: pre-wrap;
}

.fim {
  margin: 20px 24px 32px;
  text-align: center;
  font-size: 13px;
  color: #9a9a9a;
}

.centro {
  text-align: center;
  padding: 24px 16px;
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
