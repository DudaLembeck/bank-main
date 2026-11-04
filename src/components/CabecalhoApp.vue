<template>
  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="ir('/perfil')">
          <ion-icon slot="icon-only" :icon="personCircleOutline" />
        </ion-button>
        <ion-button @click="ir('/notificacoes')">
          <ion-icon slot="icon-only" :icon="notificationsOutline" />
        </ion-button>
      </ion-buttons>

      <h4>Bem vindo(a), {{ usuario.nomeExibicao }}</h4>

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
import { useUsuarioStore } from '../stores/usuario'

const usuario = useUsuarioStore()
const router = useIonRouter()

function ir(caminho: string) {
  router.push(caminho)
}
</script>

<style scoped>
ion-toolbar {
  --background: rgb(248, 239, 243);
  --border-width: 0;
}

ion-icon {
  color: var(--ion-color-primary-shade);
  font-size: 26px;
}

h4 {
  margin: 0 0 0 4px;
  font-size: 15px;
  font-weight: 400;
  color: rgb(107, 104, 104);
}

ion-title {
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--ion-color-tertiary);
}
</style>
