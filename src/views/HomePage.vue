<template>
  <ion-page>
    <CabecalhoApp />

    <ion-content :fullscreen="true" class="fundo">
      <ion-card class="cartao-saldo">
        <ion-card-content>
          <div class="linha-saldo">
            <span class="rotulo">Saldo do terceirão</span>
            <ion-button fill="clear" size="small" @click="oculto = !oculto">
              <ion-icon
                slot="icon-only"
                :icon="oculto ? eyeOffOutline : eyeOutline"
              />
            </ion-button>
          </div>

          <ion-spinner v-if="carregando" name="dots" />

          <template v-else-if="caixa.erro">
            <p class="erro">{{ caixa.erro }}</p>
            <ion-button fill="clear" size="small" @click="carregar">
              tentar de novo
            </ion-button>
          </template>

          <strong v-else class="valor">
            {{ oculto ? 'R$ ••••••' : formatarReal(caixa.saldoCentavos) }}
          </strong>

          <ion-button
            fill="clear"
            size="small"
            class="ver-extrato"
            router-link="/extrato"
          >
            Ver extrato
          </ion-button>
        </ion-card-content>
      </ion-card>

      <TituloSecao texto="Quadro de anúncios" />

      <ion-card class="quadro">
        <ion-card-content>
          <ion-spinner v-if="carregandoAnuncios" name="dots" />

          <p v-else-if="erroAnuncios" class="erro">{{ erroAnuncios }}</p>

          <p v-else-if="!anuncios.length" class="sem-anuncios">
            Sem novos anúncios.
          </p>

          <template v-else>
            <div v-for="anuncio in anuncios" :key="anuncio.id" class="aviso">
              <p class="texto-aviso">
                <ion-icon v-if="anuncio.fixado" :icon="pin" class="icone-fixado" />
                {{ anuncio.texto }}
              </p>
              <span class="autor-aviso">
                {{ anuncio.perfil?.nome ?? 'Comissão' }} ·
                {{ formatarDataHora(anuncio.data) }}
              </span>
            </div>
          </template>

          <ion-button
            fill="clear"
            size="small"
            class="ver-tudo"
            router-link="/anuncios"
          >
            Ver tudo
          </ion-button>
        </ion-card-content>
      </ion-card>

      <TituloSecao texto="Atualizações" />

      <BarraNovoPost @abrir="novoPostAberto = true" />

      <div v-if="feed.carregando.value" class="centro-feed">
        <ion-spinner name="dots" />
      </div>

      <div v-else-if="feed.erro.value" class="centro-feed">
        <p class="erro">{{ feed.erro.value }}</p>
        <ion-button fill="clear" size="small" @click="feed.carregar()">
          tentar de novo
        </ion-button>
      </div>

      <p v-else-if="!feed.posts.value.length" class="sem-posts">
        Ainda não há posts. Seja a primeira pessoa a publicar!
      </p>

      <template v-else>
        <CartaoPost
          v-for="post in feed.posts.value"
          :key="post.id"
          :post="post"
          :pode-apagar="feed.podeApagar(post)"
          @curtir="feed.alternarCurtida(post)"
          @apagar="feed.confirmarRemocao(post)"
        />
      </template>

      <ion-button
        expand="block"
        fill="outline"
        class="ver-todos"
        router-link="/posts"
      >
        VER TODOS OS POSTS
        <ion-icon slot="end" :icon="arrowForwardOutline" />
      </ion-button>

      <NovoPostModal
        :aberto="novoPostAberto"
        @fechar="novoPostAberto = false"
        @publicado="feed.carregar()"
      />

      <TituloSecao texto="Atalhos" />

      <ion-list lines="none" class="atalhos">
        <ion-item
          v-for="atalho in atalhos"
          :key="atalho.caminho"
          button
          :detail="true"
          :router-link="atalho.caminho"
        >
          <ion-icon slot="start" :icon="atalho.icone" />
          <ion-label>
            <h2>{{ atalho.titulo }}</h2>
            <p>{{ atalho.descricao }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <p class="papel">
        {{ usuario.ehComissao ? 'Conta da comissão' : 'Conta de aluno' }}
      </p>

      <ion-button
        fill="clear"
        expand="block"
        class="sair"
        @click="encerrarSessao"
      >
        <ion-icon slot="start" :icon="logOutOutline" />
        SAIR
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
  onIonViewWillEnter,
  useIonRouter
} from '@ionic/vue'
import {
  arrowForwardOutline,
  calendarOutline,
  chatbubblesOutline,
  eyeOffOutline,
  eyeOutline,
  imagesOutline,
  logOutOutline,
  megaphoneOutline,
  pin,
  walletOutline
} from 'ionicons/icons'
import BarraNovoPost from '../components/BarraNovoPost.vue'
import CabecalhoApp from '../components/CabecalhoApp.vue'
import CartaoPost from '../components/CartaoPost.vue'
import NovoPostModal from '../components/NovoPostModal.vue'
import TituloSecao from '../components/TituloSecao.vue'
import { useFeed } from '../composables/useFeed'
import { listarAnuncios, type Anuncio } from '../services/anuncioService'
import { formatarDataHora } from '../services/data'
import { formatarReal } from '../services/dinheiro'
import { useCaixaStore } from '../stores/caixa'
import { useUsuarioStore } from '../stores/usuario'

const usuario = useUsuarioStore()
const caixa = useCaixaStore()
const router = useIonRouter()

const feed = useFeed(3)
const novoPostAberto = ref(false)
const oculto = ref(false)
const carregando = ref(true)
const anuncios = ref<Anuncio[]>([])
const carregandoAnuncios = ref(true)
const erroAnuncios = ref('')

const atalhos = [
  {
    titulo: 'Extrato do caixa',
    descricao: 'Entradas e saídas, com o motivo de cada uma',
    caminho: '/extrato',
    icone: walletOutline
  },
  {
    titulo: 'Dias D e eventos',
    descricao: 'Cadastre e acompanhe os eventos do terceirão',
    caminho: '/eventos',
    icone: calendarOutline
  },
  {
    titulo: 'Anúncios',
    descricao: 'Avisos da comissão',
    caminho: '/anuncios',
    icone: megaphoneOutline
  },
  {
    titulo: 'Posts',
    descricao: 'O que a turma está publicando',
    caminho: '/posts',
    icone: chatbubblesOutline
  },
  {
    titulo: 'Galeria de turmas',
    descricao: 'Fotos dos dias D',
    caminho: '/galeria',
    icone: imagesOutline
  }
]

async function carregar() {
  carregando.value = true
  await caixa.carregarSaldo()
  carregando.value = false
}

async function carregarAnuncios() {
  carregandoAnuncios.value = true
  erroAnuncios.value = ''
  try {
    anuncios.value = await listarAnuncios(2)
  } catch (e: unknown) {
    erroAnuncios.value =
      e instanceof Error ? e.message : 'Erro ao carregar os anúncios.'
  } finally {
    carregandoAnuncios.value = false
  }
}

onIonViewWillEnter(() => {
  feed.carregar()
  carregar()
  carregarAnuncios()
})

async function encerrarSessao() {
  await usuario.sair()
  router.replace('/login')
}
</script>

<style scoped>
.fundo {
  --background: rgb(248, 239, 243);
}

.cartao-saldo {
  margin: 18px 16px 0;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(155, 34, 98, 0.12);
}

.linha-saldo {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rotulo {
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #9a9a9a;
}

.valor {
  display: block;
  margin: 4px 0 6px;
  font-size: 30px;
  color: var(--ion-color-tertiary);
}

.ver-extrato,
.linha-saldo ion-button {
  --color: var(--ion-color-tertiary);
}

.erro {
  font-size: 13px;
  color: var(--ion-color-danger);
}

.quadro {
  margin: 0 16px;
  border-radius: 18px;
  box-shadow: 0 5px 16px rgba(155, 34, 98, 0.12);
}

.aviso {
  padding: 8px 0;
  border-bottom: 1px solid rgba(155, 34, 98, 0.12);
}

.aviso:last-of-type {
  border-bottom: none;
}

.texto-aviso {
  margin: 0;
  font-size: 14px;
  line-height: 19px;
  color: #4a4a4a;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.icone-fixado {
  margin-right: 2px;
  vertical-align: -2px;
  color: var(--ion-color-tertiary);
}

.autor-aviso {
  font-size: 11px;
  color: #9a9a9a;
}

.sem-anuncios {
  margin: 4px 0 0;
  font-size: 13px;
  color: #9a9a9a;
}

.ver-tudo {
  --color: var(--ion-color-tertiary);
  margin: 6px 0 -6px;
}

.centro-feed {
  text-align: center;
  padding: 20px 16px;
}

.sem-posts {
  margin: 20px 24px;
  text-align: center;
  font-size: 13px;
  color: #9a9a9a;
}

.ver-todos {
  --color: var(--ion-color-tertiary);
  --border-color: var(--ion-color-tertiary);
  --border-radius: 14px;
  margin: 10px 16px 0;
  font-weight: 700;
  letter-spacing: 1px;
}

.atalhos {
  background: transparent;
  padding: 0 16px;
}

.atalhos ion-item {
  --background: #ffffff;
  --border-radius: 14px;
  --padding-start: 14px;
  margin-bottom: 10px;
  box-shadow: 0 3px 10px rgba(155, 34, 98, 0.1);
  border-radius: 14px;
}

.atalhos ion-icon {
  color: var(--ion-color-tertiary);
}

.atalhos h2 {
  font-size: 15px;
  font-weight: 600;
  color: var(--ion-color-tertiary);
}

.atalhos p {
  font-size: 12px;
  color: #6b6868;
}

.papel {
  margin: 12px 0 0;
  text-align: center;
  font-size: 12px;
  color: #9a9a9a;
}

.sair {
  --color: var(--ion-color-tertiary);
  margin: 4px 16px 32px;
  font-weight: 700;
  letter-spacing: 1px;
}
</style>
