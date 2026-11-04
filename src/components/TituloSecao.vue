<template>
  <div class="titulo-secao">
    <span class="traco"></span>
    <h2>{{ texto }}</h2>
    <span class="traco"></span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ texto: string }>()
</script>

<style scoped>
.titulo-secao {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 16px;
}

h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--ion-color-tertiary);
  white-space: nowrap;
}

.traco {
  flex: 1;
  height: 1px;
  background: var(--ion-color-tertiary);
  opacity: 0.5;
}
</style>
