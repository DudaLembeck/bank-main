<template>
  <ion-page>
    <MarcaTopo />

    <ion-content :fullscreen="true" class="fundo">
      <TituloSecao texto="Login" />

      <CartaoFormulario titulo="SUAS INFORMAÇÕES">
        <ion-list lines="none" class="campos">
          <ion-item>
            <ion-input
              v-model="email"
              type="email"
              label="email"
              label-placement="floating"
              autocomplete="email"
              :clear-input="true"
              :error-text="erroEmail"
              :class="{ 'ion-invalid ion-touched': tocado && erroEmail }"
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model="senha"
              type="password"
              label="senha"
              label-placement="floating"
              autocomplete="current-password"
              :error-text="erroSenha"
              :class="{ 'ion-invalid ion-touched': tocado && erroSenha }"
              @keyup.enter="autenticar"
            />
          </ion-item>
        </ion-list>

        <p v-if="erroGeral" class="erro-geral">{{ erroGeral }}</p>

        <ion-button
          expand="block"
          fill="clear"
          :disabled="carregando"
          @click="autenticar"
        >
          <ion-spinner v-if="carregando" name="dots" />
          <span v-else>ENTRAR</span>
        </ion-button>

        <ion-button
          class="link"
          fill="clear"
          size="small"
          expand="block"
          router-link="/recuperar-senha"
        >
          esqueceu sua senha?
        </ion-button>
      </CartaoFormulario>

      <div class="rodape">
        <span>ainda não tem conta?</span>
        <ion-button fill="clear" size="small" router-link="/cadastro">
          criar conta
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonSpinner,
  useIonRouter
} from '@ionic/vue'
import CartaoFormulario from '../components/CartaoFormulario.vue'
import MarcaTopo from '../components/MarcaTopo.vue'
import TituloSecao from '../components/TituloSecao.vue'
import { useUsuarioStore } from '../stores/usuario'

const router = useIonRouter()
const usuario = useUsuarioStore()

const email = ref('')
const senha = ref('')
const tocado = ref(false)
const carregando = ref(false)
const erroGeral = ref('')

const erroEmail = computed(() => {
  if (!email.value.trim()) return 'Informe seu e-mail.'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) {
    return 'E-mail inválido.'
  }
  return ''
})

const erroSenha = computed(() =>
  senha.value.length < 6 ? 'A senha precisa ter pelo menos 6 caracteres.' : ''
)

const formularioValido = computed(() => !erroEmail.value && !erroSenha.value)

async function autenticar() {
  tocado.value = true
  erroGeral.value = ''
  if (!formularioValido.value) return

  carregando.value = true
  try {
    await usuario.entrar(email.value, senha.value)
    router.replace('/home')
  } catch (e: unknown) {
    erroGeral.value = e instanceof Error ? e.message : 'Não foi possível entrar.'
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.fundo {
  --background: rgb(248, 239, 243);
}

.erro-geral {
  margin: 4px 0 0;
  font-size: 13px;
  text-align: center;
  color: var(--ion-color-danger);
}

ion-button {
  --color: var(--ion-color-tertiary);
  font-weight: 700;
  letter-spacing: 1px;
  margin-top: 10px;
}

ion-button.link {
  --color: #8c8c8c;
  --padding-top: 14px;
  --padding-bottom: 14px;
  height: auto;
  min-height: 48px;
  margin-top: 20px;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
}

.rodape {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin: 18px 0 32px;
  font-size: 13px;
  color: #8c8c8c;
}

.rodape ion-button {
  margin-top: 0;
  --padding-start: 4px;
  --padding-end: 4px;
}
</style>
