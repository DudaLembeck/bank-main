<template>
  <ion-header class="marca-topo" :translucent="true">
    <ion-toolbar>
      <ion-title slot="end">3BANK</ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonTitle, IonToolbar } from '@ionic/vue'
</script>

<style scoped>
ion-toolbar {
  --background: rgb(248, 239, 243);
  --border-width: 0;
}

ion-title {
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--ion-color-tertiary);
}
</style>
