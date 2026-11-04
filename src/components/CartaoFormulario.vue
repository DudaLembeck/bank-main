<template>
  <div class="cartao-externo">
    <div class="cartao-interno">
      <h3>{{ titulo }}</h3>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ titulo: string }>()
</script>

<style scoped>
.cartao-externo {
  margin: 8px 16px 0;
  padding: 24px 18px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(155, 34, 98, 0.12);
}

.cartao-interno {
  background: rgba(251, 183, 219, 0.22);
  border-radius: 16px;
  padding: 22px 16px;
}

h3 {
  margin: 0 0 14px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--ion-color-tertiary);
}

:slotted(ion-list) {
  background: transparent;
  padding: 0;
}

:slotted(ion-list) ion-item {
  --background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  --min-height: 46px;
  --highlight-height: 0;
  border-bottom: 1px solid var(--ion-color-primary-shade);
  margin-bottom: 10px;
}

:slotted(ion-list) ion-input {
  --background: transparent;
  --color: #4a4a4a;
  --placeholder-color: #9a9a9a;
  --padding-start: 0;
  font-size: 14px;
}
</style>
