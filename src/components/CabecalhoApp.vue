<template>
  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-buttons slot="start" class="botoes">
        <ion-button class="botao-perfil" @click="ir('/perfil')">
          <img v-if="fotoUrl" slot="icon-only" :src="fotoUrl" class="avatar" alt="perfil" />
          <ion-icon v-else slot="icon-only" :icon="personCircleOutline" />
        </ion-button>
        <ion-button @click="ir('/notificacoes')">
          <ion-icon slot="icon-only" :icon="notificationsOutline" />
        </ion-button>
      </ion-buttons>

      <div class="saudacao">
        <span class="ola">Bem vindo(a),</span>
        <strong class="nome">{{ nomeFormatado }}</strong>
      </div>

      <ion-title slot="end">3BANK</ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  useIonRouter
} from '@ionic/vue'
import { notificationsOutline, personCircleOutline } from 'ionicons/icons'
import { computed } from 'vue'
import { urlPublica } from '../services/imagemService'
import { nomeBonito } from '../services/nome'
import { useUsuarioStore } from '../stores/usuario'

const usuario = useUsuarioStore()
const router = useIonRouter()

const fotoUrl = computed(() =>
  usuario.perfil?.foto_perfil
    ? urlPublica('perfis', usuario.perfil.foto_perfil)
    : ''
)

const nomeFormatado = computed(() => nomeBonito(usuario.nomeExibicao))

function ir(caminho: string) {
  router.push(caminho)
}
</script>

<style scoped>
ion-toolbar {
  --background: rgb(248, 239, 243);
  --border-width: 0;
  --min-height: 56px;
}

.botoes {
  flex-shrink: 0;
}

.botoes ion-button {
  --padding-start: 6px;
  --padding-end: 6px;
}

ion-icon {
  color: var(--ion-color-primary-shade);
  font-size: 26px;
}

.avatar {
  display: block;
  box-sizing: border-box;
  flex: none;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--ion-color-primary);
}

.saudacao {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 0 4px;
}

.ola {
  font-size: 11px;
  line-height: 14px;
  color: #8c8c8c;
}

.nome {
  font-size: 13px;
  line-height: 16px;
  font-weight: 600;
  color: #4a4a4a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

ion-title {
  flex: 0 0 auto;
  width: auto;
  padding: 0 14px 0 6px;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--ion-color-tertiary);
}
</style>
