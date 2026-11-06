<template>
  <ion-page>
    <CabecalhoApp />

    <ion-content :fullscreen="true" class="fundo">
      <PilulasNavegacao grupo="posts" />
      <TituloSecao texto="Posts" />

      <ion-button expand="block" class="botao-novo" @click="abrirNovo">
        <ion-icon slot="start" :icon="createOutline" />
        NOVO POST
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

      <p v-else-if="!posts.length" class="vazio">
        Nenhum post ainda. Seja a primeira pessoa a publicar!
      </p>

      <template v-else>
      <ion-card v-for="post in posts" :key="post.id" class="post">
        <ion-card-content>
          <div class="topo-post">
            <div>
              <strong class="autor">{{ post.perfil?.nome ?? 'Alguém' }}</strong>
              <span class="data">{{ formatarDataHora(post.data) }}</span>
            </div>
            <ion-button
              v-if="podeApagar(post)"
              fill="clear"
              size="small"
              color="danger"
              @click="confirmarRemocao(post)"
            >
              <ion-icon slot="icon-only" :icon="trashOutline" />
            </ion-button>
          </div>

          <ion-chip v-if="post.evento" color="tertiary" class="chip-evento">
            <ion-label>{{ post.evento.nome }}</ion-label>
          </ion-chip>

          <p class="texto">{{ post.texto }}</p>

          <div
            v-if="post.post_imagem.length"
            class="grade"
            :class="'fotos-' + Math.min(post.post_imagem.length, 4)"
          >
            <ion-img
              v-for="imagem in post.post_imagem"
              :key="imagem.caminho"
              :src="urlPublica('posts', imagem.caminho)"
              alt="foto do post"
            />
          </div>
        </ion-card-content>
      </ion-card>
      </template>

      <ion-modal :is-open="modalAberto" @did-dismiss="fecharNovo">
        <ion-content class="fundo">
          <TituloSecao texto="Novo post" />

          <CartaoFormulario titulo="O QUE ACONTECEU?">
            <ion-list lines="none">
              <ion-item>
                <ion-textarea
                  v-model="texto"
                  label="texto"
                  label-placement="floating"
                  :auto-grow="true"
                  :rows="3"
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
            </ion-list>

            <div v-if="fotos.length" class="miniaturas">
              <div v-for="(foto, i) in fotos" :key="i" class="miniatura">
                <img :src="foto" alt="foto escolhida" />
                <button type="button" aria-label="remover foto" @click="tirarFoto(i)">
                  ×
                </button>
              </div>
            </div>

            <ion-button
              v-if="fotos.length < LIMITE_FOTOS"
              expand="block"
              fill="outline"
              :disabled="abrindoCamera || publicando"
              @click="adicionarFoto"
            >
              <ion-icon slot="start" :icon="cameraOutline" />
              ADICIONAR FOTO ({{ fotos.length }}/{{ LIMITE_FOTOS }})
            </ion-button>

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
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  alertController,
  toastController
} from '@ionic/vue'
import { cameraOutline, createOutline, trashOutline } from 'ionicons/icons'
import CabecalhoApp from '../components/CabecalhoApp.vue'
import CartaoFormulario from '../components/CartaoFormulario.vue'
import PilulasNavegacao from '../components/PilulasNavegacao.vue'
import TituloSecao from '../components/TituloSecao.vue'
import { useCamera } from '../composables/useCamera'
import { formatarDataHora } from '../services/data'
import { listarEventos, type Evento } from '../services/eventoService'
import { urlPublica } from '../services/imagemService'
import {
  listarPosts,
  publicarPost,
  removerPost,
  type Post
} from '../services/postService'
import { useUsuarioStore } from '../stores/usuario'

const LIMITE_FOTOS = 4

const usuario = useUsuarioStore()
const { capturar, carregando: abrindoCamera } = useCamera()

const posts = ref<Post[]>([])
const eventos = ref<Evento[]>([])
const carregando = ref(true)
const erroLista = ref('')

const modalAberto = ref(false)
const texto = ref('')
const idEvento = ref<number | null>(null)
const fotos = ref<string[]>([])
const tocado = ref(false)
const publicando = ref(false)
const erroGeral = ref('')

const erroTexto = computed(() => {
  const valor = texto.value.trim()
  if (!valor) return 'Escreva alguma coisa.'
  if (valor.length > 500) return 'Use no máximo 500 caracteres.'
  return ''
})

function podeApagar(post: Post): boolean {
  return post.id_usuario === usuario.perfil?.id || usuario.ehComissao
}

async function carregar() {
  carregando.value = true
  erroLista.value = ''
  try {
    posts.value = await listarPosts()
  } catch (e: unknown) {
    erroLista.value =
      e instanceof Error ? e.message : 'Erro ao carregar os posts.'
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

function abrirNovo() {
  texto.value = ''
  idEvento.value = null
  fotos.value = []
  tocado.value = false
  erroGeral.value = ''
  modalAberto.value = true
}

function fecharNovo() {
  modalAberto.value = false
}

async function adicionarFoto() {
  const foto = await capturar()
  if (foto) fotos.value.push(foto)
}

function tirarFoto(indice: number) {
  fotos.value.splice(indice, 1)
}

async function publicar() {
  tocado.value = true
  erroGeral.value = ''
  if (erroTexto.value || !usuario.perfil) return

  publicando.value = true
  try {
    await publicarPost(
      usuario.perfil.id,
      texto.value,
      fotos.value,
      idEvento.value
    )
    modalAberto.value = false
    await carregar()
    const aviso = await toastController.create({
      message: 'Post publicado.',
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

.post {
  margin: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 5px 16px rgba(155, 34, 98, 0.12);
}

.topo-post {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.autor {
  display: block;
  font-size: 14px;
  color: var(--ion-color-tertiary);
}

.data {
  font-size: 11px;
  color: #9a9a9a;
}

.chip-evento {
  margin: 6px 0 0;
  font-size: 11px;
  height: 24px;
}

.texto {
  margin: 8px 0;
  font-size: 14px;
  line-height: 20px;
  color: #4a4a4a;
  white-space: pre-wrap;
}

.grade {
  display: grid;
  gap: 6px;
  margin-top: 8px;
}

.grade.fotos-1 {
  grid-template-columns: 1fr;
}

.grade.fotos-2,
.grade.fotos-3,
.grade.fotos-4 {
  grid-template-columns: 1fr 1fr;
}

.grade ion-img {
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
}

.grade ion-img::part(image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grade.fotos-1 ion-img {
  aspect-ratio: 4 / 3;
}

.miniaturas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.miniatura {
  position: relative;
  width: 68px;
  height: 68px;
}

.miniatura img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.miniatura button {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: var(--ion-color-danger);
  color: #ffffff;
  font-size: 15px;
  line-height: 20px;
  cursor: pointer;
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
