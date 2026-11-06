<template>
  <div class="avatar" :style="{ width: tamanho + 'px', height: tamanho + 'px' }">
    <img v-if="url" :src="url" :alt="nome" />
    <span v-else :style="{ fontSize: tamanho * 0.42 + 'px' }">
      {{ inicialDoNome(nome) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { urlPublica } from '../services/imagemService'
import { inicialDoNome } from '../services/nome'

const props = withDefaults(
  defineProps<{ foto: string | null; nome: string; tamanho?: number }>(),
  { tamanho: 40 }
)

const url = computed(() => (props.foto ? urlPublica('perfis', props.foto) : ''))
</script>

<style scoped>
.avatar {
  flex: none;
  box-sizing: border-box;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--ion-color-primary);
  background: var(--ion-color-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

span {
  font-weight: 700;
  color: #ffffff;
}
</style>
