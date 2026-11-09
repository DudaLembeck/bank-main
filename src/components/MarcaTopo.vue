<template>
  <ion-header class="marca-topo" :translucent="true">
    <ion-toolbar>
      <span slot="end" class="marca">3BANK</span>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar } from '@ionic/vue'
</script>

<style scoped>
ion-toolbar {
  --background: rgb(248, 239, 243);
  --border-width: 0;
}

.marca {
  flex: none;
  padding: 0 16px 0 6px;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--ion-color-tertiary);
}
</style>
