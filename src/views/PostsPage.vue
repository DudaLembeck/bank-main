<template>
  <ion-page>
    <CabecalhoApp />

    <ion-content :fullscreen="true" class="fundo">
      <PilulasNavegacao grupo="posts" />
      <TituloSecao texto="Posts" />

      <BarraNovoPost @abrir="novoAberto = true" />

      <div v-if="feed.carregando.value" class="centro">
        <ion-spinner name="dots" />
      </div>

      <div v-else-if="feed.erro.value" class="centro">
        <p class="erro">{{ feed.erro.value }}</p>
        <ion-button fill="clear" size="small" @click="feed.carregar()">
          tentar de novo
        </ion-button>
      </div>

      <p v-else-if="!feed.posts.value.length" class="vazio">
        Nenhum post ainda. Seja a primeira pessoa a publicar!
      </p>

      <template v-else>
        <CartaoPost
          v-for="post in feed.posts.value"
          :key="post.id"
          :post="post"
          :pode-apagar="feed.podeApagar(post)"
          @curtir="feed.alternarCurtida(post)"
          @apagar="feed.confirmarRemocao(post)"
        />
        <p class="fim">você chegou ao fim</p>
      </template>

      <NovoPostModal
        :aberto="novoAberto"
        @fechar="novoAberto = false"
        @publicado="feed.carregar()"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonButton,
  IonContent,
  IonPage,
  IonSpinner,
  onIonViewWillEnter
} from '@ionic/vue'
import BarraNovoPost from '../components/BarraNovoPost.vue'
import CabecalhoApp from '../components/CabecalhoApp.vue'
import CartaoPost from '../components/CartaoPost.vue'
import NovoPostModal from '../components/NovoPostModal.vue'
import PilulasNavegacao from '../components/PilulasNavegacao.vue'
import TituloSecao from '../components/TituloSecao.vue'
import { useFeed } from '../composables/useFeed'

const feed = useFeed(30)
const novoAberto = ref(false)

onIonViewWillEnter(() => {
  feed.carregar()
})
</script>

<style scoped>
.fundo {
  --background: rgb(248, 239, 243);
}

.centro {
  text-align: center;
  padding: 24px 16px;
}

.vazio {
  margin: 28px 24px;
  text-align: center;
  font-size: 13px;
  color: #9a9a9a;
}

.fim {
  margin: 12px 24px 32px;
  text-align: center;
  font-size: 12px;
  color: #b0a0a8;
}

.erro {
  font-size: 13px;
  text-align: center;
  color: var(--ion-color-danger);
}
</style>
