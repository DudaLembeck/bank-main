<template>
  <button class="barra" type="button" @click="emit('abrir')">
    <AvatarUsuario
      :foto="usuario.perfil?.foto_perfil ?? null"
      :nome="usuario.nomeExibicao"
      :tamanho="38"
    />
    <span class="chamada">Compartilhe um momento com a turma…</span>
    <ion-icon :icon="imageOutline" class="icone" />
  </button>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { imageOutline } from 'ionicons/icons'
import { useUsuarioStore } from '../stores/usuario'
import AvatarUsuario from './AvatarUsuario.vue'

const emit = defineEmits<{ abrir: [] }>()
const usuario = useUsuarioStore()
</script>

<style scoped>
.barra {
  display: flex;
  align-items: center;
  gap: 10px;
  width: calc(100% - 32px);
  margin: 14px 16px 6px;
  padding: 10px 14px;
  background: #ffffff;
  border: none;
  border-radius: 28px;
  box-shadow: 0 4px 14px rgba(155, 34, 98, 0.12);
  text-align: left;
  cursor: pointer;
}

.chamada {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #8a8a8a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icone {
  flex: none;
  font-size: 22px;
  color: var(--ion-color-primary-shade);
}
</style>
