<template>
  <ion-modal :is-open="aberto" @did-dismiss="emit('fechar')">
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
              <ion-select-option v-for="e in eventos" :key="e.id" :value="e.id">
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
          @click="emit('fechar')"
        >
          cancelar
        </ion-button>
      </CartaoFormulario>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonList,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  toastController
} from '@ionic/vue'
import { cameraOutline } from 'ionicons/icons'
import { useCamera } from '../composables/useCamera'
import { listarEventos, type Evento } from '../services/eventoService'
import { publicarPost } from '../services/postService'
import { useUsuarioStore } from '../stores/usuario'
import CartaoFormulario from './CartaoFormulario.vue'
import TituloSecao from './TituloSecao.vue'

const LIMITE_FOTOS = 4

const props = defineProps<{ aberto: boolean }>()
const emit = defineEmits<{ fechar: []; publicado: [] }>()

const usuario = useUsuarioStore()
const { capturar, carregando: abrindoCamera } = useCamera()

const eventos = ref<Evento[]>([])
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

watch(
  () => props.aberto,
  async (aberto) => {
    if (!aberto) return
    texto.value = ''
    idEvento.value = null
    fotos.value = []
    tocado.value = false
    erroGeral.value = ''
    try {
      eventos.value = (await listarEventos()).filter((e) => !e.encerrado)
    } catch {
      eventos.value = []
    }
  }
)

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
    emit('publicado')
    emit('fechar')
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
</script>

<style scoped>
.fundo {
  --background: rgb(248, 239, 243);
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

.erro {
  font-size: 13px;
  text-align: center;
  color: var(--ion-color-danger);
}

ion-button {
  --color: var(--ion-color-tertiary);
  --border-color: var(--ion-color-tertiary);
  font-weight: 700;
  letter-spacing: 1px;
}
</style>
