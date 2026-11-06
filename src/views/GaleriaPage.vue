<template>
  <ion-page>
    <CabecalhoApp />

    <ion-content :fullscreen="true" class="fundo">
      <PilulasNavegacao grupo="galeria" />
      <TituloSecao texto="Galeria de turmas" />

      <ion-button expand="block" class="botao-novo" @click="abrirEnvio">
        <ion-icon slot="start" :icon="cameraOutline" />
        ENVIAR FOTO
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

      <p v-else-if="!fotos.length" class="vazio">
        Nenhuma foto ainda. Envie a primeira!
      </p>

      <template v-else>
        <ion-card v-for="foto in fotos" :key="foto.id" class="foto">
          <div class="moldura">
            <ion-img :src="urlPublica('galeria', foto.caminho)" :alt="legendaDe(foto)" />
            <div class="sobre-foto">
              <div class="textos">
                <strong v-if="tituloDe(foto)" class="titulo">{{ tituloDe(foto) }}</strong>
                <p v-if="foto.legenda" class="legenda">{{ foto.legenda }}</p>
                <span class="meta">
                  {{ foto.perfil?.nome ?? 'Alguém' }}
                  <template v-if="foto.evento"> · {{ foto.evento.nome }}</template>
                </span>
              </div>
              <ion-button
                v-if="podeApagar(foto)"
                class="apagar"
                fill="clear"
                size="small"
                @click="confirmarRemocao(foto)"
              >
                <ion-icon slot="icon-only" :icon="trashOutline" />
              </ion-button>
            </div>
          </div>
        </ion-card>
      </template>

      <ion-modal :is-open="modalAberto" @did-dismiss="fecharEnvio">
        <ion-content class="fundo">
          <TituloSecao texto="Enviar foto" />

          <CartaoFormulario titulo="SOBRE A FOTO">
            <div class="escolha">
              <img v-if="fotoEscolhida" :src="fotoEscolhida" alt="foto escolhida" />
              <p v-else class="sem-foto">Nenhuma foto escolhida.</p>
            </div>

            <ion-button
              expand="block"
              fill="outline"
              :disabled="abrindoCamera || enviando"
              @click="escolherFoto"
            >
              <ion-icon slot="start" :icon="cameraOutline" />
              {{ fotoEscolhida ? 'TROCAR FOTO' : 'ESCOLHER FOTO' }}
            </ion-button>
            <p v-if="tocado && erroFoto" class="erro">{{ erroFoto }}</p>

            <ion-list lines="none">
              <ion-item>
                <ion-input
                  v-model="turma"
                  label="turma (ex.: Terceiro 2)"
                  label-placement="floating"
                  :maxlength="40"
                />
              </ion-item>
              <ion-item>
                <ion-input
                  v-model="ano"
                  label="ano da turma (ex.: 2023)"
                  label-placement="floating"
                  inputmode="numeric"
                  :maxlength="4"
                  :error-text="erroAno"
                  :class="{ 'ion-invalid ion-touched': tocado && erroAno }"
                />
              </ion-item>
              <ion-item>
                <ion-input
                  v-model="legenda"
                  label="legenda (opcional)"
                  label-placement="floating"
                  :maxlength="200"
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
            </ion-list>

            <p v-if="erroGeral" class="erro">{{ erroGeral }}</p>

            <ion-button
              expand="block"
              fill="clear"
              :disabled="enviando"
              @click="enviar"
            >
              <ion-spinner v-if="enviando" name="dots" />
              <span v-else>ENVIAR</span>
            </ion-button>

            <ion-button
              expand="block"
              fill="clear"
              :disabled="enviando"
              @click="fecharEnvio"
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
  IonContent,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  alertController,
  toastController
} from '@ionic/vue'
import { cameraOutline, trashOutline } from 'ionicons/icons'
import CabecalhoApp from '../components/CabecalhoApp.vue'
import CartaoFormulario from '../components/CartaoFormulario.vue'
import PilulasNavegacao from '../components/PilulasNavegacao.vue'
import TituloSecao from '../components/TituloSecao.vue'
import { useCamera } from '../composables/useCamera'
import { listarEventos, type Evento } from '../services/eventoService'
import {
  enviarFoto,
  listarFotos,
  removerFoto,
  type FotoGaleria
} from '../services/galeriaService'
import { urlPublica } from '../services/imagemService'
import { useUsuarioStore } from '../stores/usuario'

const usuario = useUsuarioStore()
const { capturar, carregando: abrindoCamera } = useCamera()

const fotos = ref<FotoGaleria[]>([])
const eventos = ref<Evento[]>([])
const carregando = ref(true)
const erroLista = ref('')

const modalAberto = ref(false)
const fotoEscolhida = ref<string | null>(null)
const turma = ref('')
const ano = ref('')
const legenda = ref('')
const idEvento = ref<number | null>(null)
const tocado = ref(false)
const enviando = ref(false)
const erroGeral = ref('')

const erroFoto = computed(() =>
  fotoEscolhida.value ? '' : 'Escolha uma foto para enviar.'
)

const anoNumero = computed(() => {
  const valor = ano.value.trim()
  return valor ? Number(valor) : null
})

const erroAno = computed(() => {
  const valor = ano.value.trim()
  if (!valor) return ''
  if (!/^\d{4}$/.test(valor)) return 'Use 4 dígitos, como 2023.'
  const numero = Number(valor)
  if (numero < 1950 || numero > 2100) return 'Ano fora do permitido.'
  return ''
})

function tituloDe(foto: FotoGaleria): string {
  if (foto.turma && foto.ano) return `${foto.turma} - Turma de ${foto.ano}`
  if (foto.turma) return foto.turma
  if (foto.ano) return `Turma de ${foto.ano}`
  return ''
}

function legendaDe(foto: FotoGaleria): string {
  return foto.legenda || tituloDe(foto) || 'foto da galeria'
}

function podeApagar(foto: FotoGaleria): boolean {
  return foto.id_usuario === usuario.perfil?.id || usuario.ehComissao
}

async function carregar() {
  carregando.value = true
  erroLista.value = ''
  try {
    fotos.value = await listarFotos()
  } catch (e: unknown) {
    erroLista.value =
      e instanceof Error ? e.message : 'Erro ao carregar a galeria.'
  } finally {
    carregando.value = false
  }
}

onMounted(async () => {
  carregar()
  try {
    eventos.value = (await listarEventos()).filter((e) => !e.encerrado)
  } catch {
    eventos.value = []
  }
})

function abrirEnvio() {
  fotoEscolhida.value = null
  turma.value = ''
  ano.value = ''
  legenda.value = ''
  idEvento.value = null
  tocado.value = false
  erroGeral.value = ''
  modalAberto.value = true
}

function fecharEnvio() {
  modalAberto.value = false
}

async function escolherFoto() {
  const foto = await capturar()
  if (foto) fotoEscolhida.value = foto
}

async function enviar() {
  tocado.value = true
  erroGeral.value = ''
  if (erroFoto.value || erroAno.value) return
  if (!usuario.perfil || !fotoEscolhida.value) return

  enviando.value = true
  try {
    await enviarFoto(usuario.perfil.id, fotoEscolhida.value, {
      legenda: legenda.value,
      turma: turma.value,
      ano: anoNumero.value,
      idEvento: idEvento.value
    })
    modalAberto.value = false
    await carregar()
    const aviso = await toastController.create({
      message: 'Foto enviada.',
      duration: 2000,
      color: 'success'
    })
    await aviso.present()
  } catch (e: unknown) {
    erroGeral.value =
      e instanceof Error ? e.message : 'Não foi possível enviar a foto.'
  } finally {
    enviando.value = false
  }
}

async function confirmarRemocao(foto: FotoGaleria) {
  const alerta = await alertController.create({
    header: 'Apagar foto?',
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
    await removerFoto(foto)
    await carregar()
  } catch (e: unknown) {
    const aviso = await toastController.create({
      message: e instanceof Error ? e.message : 'Não foi possível apagar.',
      duration: 2500,
      color: 'danger'
    })
    await aviso.present()
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

.foto {
  margin: 12px 16px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 5px 16px rgba(155, 34, 98, 0.12);
}

.moldura {
  position: relative;
  height: 320px;
  overflow: hidden;
  background: #2a1f26;
}

.moldura ion-img {
  display: block;
  width: 100%;
  height: 100%;
}

.moldura ion-img::part(image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sobre-foto {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  padding: 48px 14px 12px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.82) 0%,
    rgba(0, 0, 0, 0.55) 55%,
    rgba(0, 0, 0, 0) 100%
  );
}

.textos {
  flex: 1;
  min-width: 0;
}

.titulo {
  display: block;
  font-size: 15px;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.legenda {
  margin: 2px 0;
  font-size: 13px;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.meta {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.apagar {
  --color: #ffffff;
  --background: rgba(0, 0, 0, 0.35);
  --border-radius: 50%;
  margin: 0;
  flex-shrink: 0;
}

.escolha {
  margin-bottom: 10px;
  text-align: center;
}

.escolha img {
  max-width: 100%;
  max-height: 220px;
  border-radius: 12px;
}

.sem-foto {
  font-size: 13px;
  color: #9a9a9a;
}

.centro {
  text-align: center;
  padding: 24px 16px;
}

.vazio {
  margin: 28px 24px;
  text-align: center;
  font-size: 13px;
  color: #9a9a9a;
}

.erro {
  font-size: 13px;
  text-align: center;
  color: var(--ion-color-danger);
}

ion-modal ion-button {
  --color: var(--ion-color-tertiary);
  --border-color: var(--ion-color-tertiary);
  font-weight: 700;
  letter-spacing: 1px;
}
</style>
