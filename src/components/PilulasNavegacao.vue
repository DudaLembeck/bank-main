<template>
  <div class="pilulas">
    <ion-button
      v-for="destino in destinos"
      :key="destino.caminho"
      fill="solid"
      size="small"
      :router-link="destino.caminho"
      router-direction="root"
    >
      {{ destino.texto }}
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonButton } from '@ionic/vue'

const props = defineProps<{ grupo: 'anuncios' | 'posts' | 'galeria' | 'simples' }>()

const grupos = {
  anuncios: [
    { texto: 'INÍCIO', caminho: '/home' },
    { texto: 'POSTS', caminho: '/posts' },
    { texto: 'GALERIA', caminho: '/galeria' }
  ],
  posts: [
    { texto: 'INÍCIO', caminho: '/home' },
    { texto: 'ANÚNCIOS', caminho: '/anuncios' },
    { texto: 'GALERIA', caminho: '/galeria' }
  ],
  galeria: [
    { texto: 'INÍCIO', caminho: '/home' },
    { texto: 'ANÚNCIOS', caminho: '/anuncios' },
    { texto: 'POSTS', caminho: '/posts' }
  ],
  simples: [{ texto: 'INÍCIO', caminho: '/home' }]
}

const destinos = computed(() => grupos[props.grupo])
</script>

<style scoped>
.pilulas {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 18px 16px 0;
}

ion-button {
  --background: #ffffff;
  --background-activated: rgba(251, 183, 219, 0.5);
  --background-hover: rgba(251, 183, 219, 0.3);
  --color: var(--ion-color-tertiary);
  --border-radius: 20px;
  --box-shadow: 0 3px 10px rgba(155, 34, 98, 0.12);
  --padding-start: 18px;
  --padding-end: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  font-size: 12px;
  height: 36px;
}
</style>
