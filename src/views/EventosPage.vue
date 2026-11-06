<template>
  <ion-page>
    <CabecalhoApp />

    <ion-content :fullscreen="true" class="fundo">
      <PilulasNavegacao grupo="simples" />
      <TituloSecao texto="Dias D e eventos" />

      <CartaoFormulario v-if="usuario.ehComissao" titulo="NOVO EVENTO">
        <div class="seletor">
          <ion-button
            :fill="tipo === 'dia_d' ? 'solid' : 'outline'"
            size="small"
            @click="tipo = 'dia_d'"
          >
            DIA D
          </ion-button>
          <ion-button
            :fill="tipo === 'outro' ? 'solid' : 'outline'"
            size="small"
            @click="tipo = 'outro'"
          >
            OUTRO
          </ion-button>
        </div>

        <ion-list lines="none">
          <ion-item>
            <ion-input
              v-model="nome"
              label="nome do evento"
              label-placement="floating"
              :clear-input="true"
              :error-text="erroNome"
              :class="{ 'ion-invalid ion-touched': tocado && erroNome }"
            />
          </ion-item>
          <ion-item>
            <ion-input
              v-model="dataEvento"
              type="date"
              label="data"
              label-placement="stacked"
            />
          </ion-item>
          <ion-item>
            <ion-textarea
              v-model="descricao"
              label="descrição (opcional)"
              label-placement="floating"
              :auto-grow="true"
              :rows="2"
              :maxlength="300"
            />
          </ion-item>
        </ion-list>

        <p v-if="erroGeral" class="erro">{{ erroGeral }}</p>

        <ion-button
          expand="block"
          fill="clear"
          :disabled="salvando"
          @click="salvar"
        >
          <ion-spinner v-if="salvando" name="dots" />
          <span v-else>CADASTRAR EVENTO</span>
        </ion-button>
      </CartaoFormulario>

      <div class="lista">
        <h3>Eventos cadastrados</h3>

        <div v-if="carregando" class="centro">
          <ion-spinner name="dots" />
        </div>

        <div v-else-if="erroLista" class="centro">
          <p class="erro">{{ erroLista }}</p>
          <ion-button fill="clear" size="small" @click="carregar">
            tentar de novo
          </ion-button>
        </div>

        <p v-else-if="!eventos.length" class="vazio">
          Nenhum evento cadastrado ainda.
        </p>

        <ion-list v-else lines="none">
          <ion-item v-for="e in eventos" :key="e.id">
            <ion-label>
              <h2>{{ e.nome }}</h2>
              <p>
                {{ e.tipo === 'dia_d' ? 'Dia D' : 'Evento' }}
                <span v-if="e.data_evento"> · {{ formatarDia(e.data_evento) }}</span>
              </p>
              <p v-if="e.descricao">{{ e.descricao }}</p>
            </ion-label>
            <ion-chip
              v-if="e.encerrado"
              slot="end"
              color="medium"
              @click="alternar(e)"
            >
              <ion-label>encerrado</ion-label>
            </ion-chip>
            <ion-chip
              v-else
              slot="end"
              color="success"
              @click="alternar(e)"
            >
              <ion-label>aberto</ion-label>
            </ion-chip>
          </ion-item>
        </ion-list>

        <p v-if="usuario.ehComissao && eventos.length" class="dica">
          Toque em "aberto" ou "encerrado" para alternar.
        </p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import {
  IonButton,
  IonChip,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
  IonTextarea,
  toastController
} from '@ionic/vue'
import CabecalhoApp from '../components/CabecalhoApp.vue'
import CartaoFormulario from '../components/CartaoFormulario.vue'
import PilulasNavegacao from '../components/PilulasNavegacao.vue'
import TituloSecao from '../components/TituloSecao.vue'
import { useUsuarioStore } from '../stores/usuario'
import {
  alternarEncerrado,
  criarEvento,
  listarEventos,
  type Evento
} from '../services/eventoService'

const usuario = useUsuarioStore()

const eventos = ref<Evento[]>([])
const carregando = ref(false)
const erroLista = ref('')

const nome = ref('')
const tipo = ref<'dia_d' | 'outro'>('dia_d')
const dataEvento = ref('')
const descricao = ref('')
const tocado = ref(false)
const salvando = ref(false)
const erroGeral = ref('')

const erroNome = computed(() => {
  const valor = nome.value.trim()
  if (!valor) return 'Informe o nome do evento.'
  if (valor.length < 2 || valor.length > 80) return 'Use de 2 a 80 caracteres.'
  return ''
})

function formatarDia(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

async function carregar() {
  carregando.value = true
  erroLista.value = ''
  try {
    eventos.value = await listarEventos()
  } catch (e: unknown) {
    erroLista.value =
      e instanceof Error ? e.message : 'Erro ao carregar os eventos.'
  } finally {
    carregando.value = false
  }
}

onIonViewWillEnter(carregar)

async function salvar() {
  tocado.value = true
  erroGeral.value = ''
  if (erroNome.value) return

  salvando.value = true
  try {
    await criarEvento(nome.value, tipo.value, dataEvento.value, descricao.value)
    nome.value = ''
    dataEvento.value = ''
    descricao.value = ''
    tocado.value = false
    await carregar()
    const aviso = await toastController.create({
      message: 'Evento cadastrado.',
      duration: 2000,
      color: 'success'
    })
    await aviso.present()
  } catch (e: unknown) {
    erroGeral.value =
      e instanceof Error ? e.message : 'Não foi possível cadastrar.'
  } finally {
    salvando.value = false
  }
}

async function alternar(evento: Evento) {
  if (!usuario.ehComissao) return
  try {
    await alternarEncerrado(evento.id, !evento.encerrado)
    await carregar()
  } catch (e: unknown) {
    erroLista.value =
      e instanceof Error ? e.message : 'Não foi possível alterar.'
  }
}
</script>

<style scoped>
.fundo {
  --background: rgb(248, 239, 243);
}

.seletor {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
}

.seletor ion-button {
  --color: var(--ion-color-tertiary);
  --border-color: var(--ion-color-tertiary);
  font-weight: 700;
  letter-spacing: 1px;
  min-width: 110px;
}

.lista {
  margin: 20px 16px 32px;
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

.lista ion-item {
  --background: rgba(251, 183, 219, 0.18);
  --border-radius: 12px;
  --padding-start: 12px;
  margin-bottom: 8px;
}

.lista ion-item h2 {
  font-size: 15px;
  font-weight: 600;
  color: var(--ion-color-tertiary);
}

.lista ion-item p {
  font-size: 12px;
  color: #6b6868;
}

.centro {
  text-align: center;
  padding: 16px;
}

.vazio,
.dica {
  text-align: center;
  font-size: 12px;
  color: #9a9a9a;
  padding: 8px;
}

.erro {
  font-size: 13px;
  text-align: center;
  color: var(--ion-color-danger);
}

ion-button {
  --color: var(--ion-color-tertiary);
  font-weight: 700;
  letter-spacing: 1px;
}
</style>
