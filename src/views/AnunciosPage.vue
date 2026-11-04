<template>
  <ion-page>
    <CabecalhoApp />

    <ion-content :fullscreen="true" class="fundo">
      <PilulasNavegacao grupo="anuncios" />
      <TituloSecao texto="Anúncios" />

      <p class="aviso">Esta tela ainda será construída.</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue'
import CabecalhoApp from '../components/CabecalhoApp.vue'
import PilulasNavegacao from '../components/PilulasNavegacao.vue'
import TituloSecao from '../components/TituloSecao.vue'
</script>

<style scoped>
.fundo {
  --background: rgb(248, 239, 243);
}

.aviso {
  margin: 40px 24px;
  text-align: center;
  font-size: 13px;
  color: #9a9a9a;
}
</style>
