<template>
  <article class="post">
    <header class="topo">
      <AvatarUsuario
        :foto="post.perfil?.foto_perfil ?? null"
        :nome="nomeAutor"
        :tamanho="42"
      />

      <div class="autoria">
        <div class="linha-nome">
          <strong class="nome">{{ nomeBonito(nomeAutor) }}</strong>
          <ion-icon
            v-if="post.perfil?.is_admin"
            :icon="shieldCheckmark"
            class="selo"
            aria-label="Comissão"
          />
        </div>
        <span class="tempo">{{ tempoRelativo(post.data) }}</span>
      </div>

      <ion-button
        v-if="podeApagar"
        fill="clear"
        size="small"
        class="apagar"
        aria-label="apagar post"
        @click="emit('apagar')"
      >
        <ion-icon slot="icon-only" :icon="trashOutline" />
      </ion-button>
    </header>

    <ion-chip v-if="post.evento" class="evento">
      <ion-icon :icon="calendarOutline" />
      <ion-label>{{ post.evento.nome }}</ion-label>
    </ion-chip>

    <p class="texto">{{ post.texto }}</p>

    <div
      v-if="post.post_imagem.length"
      class="grade"
      :class="'fotos-' + Math.min(post.post_imagem.length, 4)"
    >
      <ion-img
        v-for="imagem in post.post_imagem"
        :key="imagem.caminho"
        :src="urlPublica('posts', imagem.caminho)"
        alt="foto do post"
      />
    </div>

    <footer class="rodape">
      <button
        type="button"
        class="curtir"
        :class="{ ativo: post.curti }"
        :aria-pressed="post.curti"
        aria-label="curtir"
        @click="emit('curtir')"
      >
        <ion-icon :icon="post.curti ? heart : heartOutline" />
        <span>{{ rotuloCurtidas }}</span>
      </button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonButton, IonChip, IonIcon, IonImg, IonLabel } from '@ionic/vue'
import {
  calendarOutline,
  heart,
  heartOutline,
  shieldCheckmark,
  trashOutline
} from 'ionicons/icons'
import { tempoRelativo } from '../services/data'
import { urlPublica } from '../services/imagemService'
import { nomeBonito } from '../services/nome'
import type { Post } from '../services/postService'
import AvatarUsuario from './AvatarUsuario.vue'

const props = defineProps<{ post: Post; podeApagar: boolean }>()
const emit = defineEmits<{ curtir: []; apagar: [] }>()

const nomeAutor = computed(() => props.post.perfil?.nome ?? 'Alguém')

const rotuloCurtidas = computed(() => {
  const total = props.post.curtidas
  if (total === 0) return 'Curtir'
  return total === 1 ? '1 curtida' : `${total} curtidas`
})
</script>

<style scoped>
.post {
  margin: 12px 16px;
  padding: 14px 14px 6px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 5px 16px rgba(155, 34, 98, 0.12);
}

.topo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.autoria {
  flex: 1;
  min-width: 0;
}

.linha-nome {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nome {
  min-width: 0;
  font-size: 14px;
  color: #3d3d3d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selo {
  flex: none;
  font-size: 14px;
  color: var(--ion-color-tertiary);
}

.tempo {
  font-size: 11px;
  color: #9a9a9a;
}

.apagar {
  --color: #9a9a9a;
  flex: none;
  margin: 0;
}

.evento {
  margin: 8px 0 0;
  height: 26px;
  font-size: 11px;
  --background: rgba(251, 183, 219, 0.3);
  --color: var(--ion-color-tertiary);
}

.texto {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 20px;
  color: #3d3d3d;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.grade {
  display: grid;
  gap: 4px;
  margin-top: 10px;
  border-radius: 14px;
  overflow: hidden;
}

.grade.fotos-1 {
  grid-template-columns: 1fr;
}

.grade.fotos-2,
.grade.fotos-3,
.grade.fotos-4 {
  grid-template-columns: 1fr 1fr;
}

.grade ion-img {
  aspect-ratio: 1 / 1;
  background: #f3e3ec;
}

.grade.fotos-1 ion-img {
  aspect-ratio: 4 / 3;
}

.grade ion-img::part(image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rodape {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding-top: 4px;
  border-top: 1px solid rgba(155, 34, 98, 0.1);
}

.curtir {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 6px;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: #7a7a7a;
  cursor: pointer;
}

.curtir ion-icon {
  font-size: 22px;
}

.curtir.ativo {
  color: var(--ion-color-danger);
}
</style>
