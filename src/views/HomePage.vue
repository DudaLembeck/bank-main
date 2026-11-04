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
import { onMounted, ref } from 'vue'
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
  useIonRouter
} from '@ionic/vue'
import {
  calendarOutline,
  chatbubblesOutline,
  eyeOffOutline,
  eyeOutline,
  imagesOutline,
  logOutOutline,
  megaphoneOutline,
  walletOutline
} from 'ionicons/icons'
import CabecalhoApp from '../components/CabecalhoApp.vue'
import TituloSecao from '../components/TituloSecao.vue'
import { formatarReal } from '../services/dinheiro'
import { useCaixaStore } from '../stores/caixa'
import { useUsuarioStore } from '../stores/usuario'

const usuario = useUsuarioStore()
const caixa = useCaixaStore()
const router = useIonRouter()

const oculto = ref(false)
const carregando = ref(true)

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

onMounted(carregar)

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
