<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-icon size="large" slot="start" :icon="personCircle"></ion-icon>
        <h4>Bem vindo(a), {{ usuario.nomeExibicao }}</h4>
        <ion-buttons slot="end">
          <ion-button @click="encerrarSessao">
            <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title slot="end"> 3BANK</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="fundo">
      <div id="container">
        <p v-if="usuario.ehComissao">Você é da comissão.</p>
        <p v-else>Conta de aluno.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter
} from '@ionic/vue';
import { logOutOutline, personCircle } from 'ionicons/icons';
import { useUsuarioStore } from '../stores/usuario';

const usuario = useUsuarioStore()
const router = useIonRouter()

async function encerrarSessao() {
  await usuario.sair()
  router.replace('/login')
}
</script>

<style scoped>
.fundo {
  --background: rgb(248, 239, 243);
}

ion-toolbar {
 --background: rgb(248, 239, 243);
}

h4 {
  font-size: 16px;
  margin-left: 10px;
  color:rgb(107, 104, 104);
}

ion-icon {
  color: var(--ion-color-primary-shade);
   --ionicon-stroke-width: 50px;
  margin-left: 20px;
}

ion-title {
   font-weight: bold;
   color: var(--ion-color-primary-shade);
   }

#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}
</style>
