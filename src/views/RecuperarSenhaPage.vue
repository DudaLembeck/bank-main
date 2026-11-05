<template>
  <ion-page>
    <MarcaTopo />

    <ion-content :fullscreen="true" class="fundo">
      <TituloSecao texto="Recuperar senha" />

      <CartaoFormulario
        v-if="etapa === 'email'"
        titulo="QUAL É O SEU E-MAIL?"
      >
        <p class="instrucao">
          Vamos enviar um código de verificação para o e-mail da sua conta.
        </p>

        <ion-list lines="none">
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
              @keyup.enter="enviarCodigo"
            />
          </ion-item>
        </ion-list>

        <p v-if="erroGeral" class="erro-geral">{{ erroGeral }}</p>

        <ion-button
          expand="block"
          fill="clear"
          :disabled="carregando"
          @click="enviarCodigo"
        >
          <ion-spinner v-if="carregando" name="dots" />
          <span v-else>ENVIAR CÓDIGO</span>
        </ion-button>
      </CartaoFormulario>

      <CartaoFormulario v-else titulo="NOVA SENHA">
        <p class="instrucao">
          Se existir uma conta para <strong>{{ email.trim() }}</strong>, o código
          chegou por e-mail. Olhe também a caixa de spam.
        </p>

        <ion-list lines="none">
          <ion-item>
            <ion-input
              v-model="codigo"
              label="código recebido"
              label-placement="floating"
              inputmode="numeric"
              autocomplete="one-time-code"
              :maxlength="10"
              :error-text="erroCodigo"
              :class="{ 'ion-invalid ion-touched': tocado && erroCodigo }"
              @ion-input="codigo = codigo.replace(/\D/g, '')"
            />
          </ion-item>
          <ion-item>
            <ion-input
              v-model="senha"
              type="password"
              label="nova senha"
              label-placement="floating"
              autocomplete="new-password"
              :error-text="erroSenha"
              :class="{ 'ion-invalid ion-touched': tocado && erroSenha }"
            />
          </ion-item>
          <ion-item>
            <ion-input
              v-model="confirmacao"
              type="password"
              label="repita a nova senha"
              label-placement="floating"
              autocomplete="new-password"
              :error-text="erroConfirmacao"
              :class="{ 'ion-invalid ion-touched': tocado && erroConfirmacao }"
              @keyup.enter="redefinir"
            />
          </ion-item>
        </ion-list>

        <p v-if="erroGeral" class="erro-geral">{{ erroGeral }}</p>

        <ion-button
          expand="block"
          fill="clear"
          :disabled="carregando"
          @click="redefinir"
        >
          <ion-spinner v-if="carregando" name="dots" />
          <span v-else>REDEFINIR SENHA</span>
        </ion-button>

        <ion-button
          expand="block"
          fill="clear"
          size="small"
          :disabled="carregando || espera > 0"
          @click="reenviar"
        >
          {{ espera > 0 ? `reenviar código em ${espera}s` : 'reenviar código' }}
        </ion-button>
      </CartaoFormulario>

      <div class="rodape">
        <ion-button fill="clear" size="small" router-link="/login">
          voltar ao login
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonSpinner,
  toastController,
  useIonRouter
} from '@ionic/vue'
import CartaoFormulario from '../components/CartaoFormulario.vue'
import MarcaTopo from '../components/MarcaTopo.vue'
import TituloSecao from '../components/TituloSecao.vue'
import { useUsuarioStore } from '../stores/usuario'

const ESPERA_REENVIO = 60

const router = useIonRouter()
const usuario = useUsuarioStore()

const etapa = ref<'email' | 'codigo'>('email')
const email = ref('')
const codigo = ref('')
const senha = ref('')
const confirmacao = ref('')
const tocado = ref(false)
const carregando = ref(false)
const erroGeral = ref('')
const espera = ref(0)

let relogio: ReturnType<typeof setInterval> | null = null

const erroEmail = computed(() => {
  if (!email.value.trim()) return 'Informe seu e-mail.'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) {
    return 'E-mail inválido.'
  }
  return ''
})

const erroCodigo = computed(() =>
  /^\d{6,10}$/.test(codigo.value.trim())
    ? ''
    : 'Digite o código numérico do e-mail.'
)

const erroSenha = computed(() =>
  senha.value.length < 6 ? 'A senha precisa ter pelo menos 6 caracteres.' : ''
)

const erroConfirmacao = computed(() =>
  confirmacao.value === senha.value ? '' : 'As senhas não são iguais.'
)

function iniciarEspera() {
  espera.value = ESPERA_REENVIO
  if (relogio) clearInterval(relogio)
  relogio = setInterval(() => {
    espera.value -= 1
    if (espera.value <= 0 && relogio) {
      clearInterval(relogio)
      relogio = null
    }
  }, 1000)
}

onBeforeUnmount(() => {
  if (relogio) clearInterval(relogio)
})

async function solicitar(): Promise<boolean> {
  erroGeral.value = ''
  carregando.value = true
  try {
    await usuario.pedirCodigo(email.value)
    iniciarEspera()
    return true
  } catch (e: unknown) {
    erroGeral.value =
      e instanceof Error ? e.message : 'Não foi possível enviar o código.'
    return false
  } finally {
    carregando.value = false
  }
}

async function enviarCodigo() {
  tocado.value = true
  if (erroEmail.value) return
  if (await solicitar()) {
    tocado.value = false
    etapa.value = 'codigo'
  }
}

async function reenviar() {
  const enviado = await solicitar()
  if (!enviado) return
  const aviso = await toastController.create({
    message: 'Código reenviado.',
    duration: 2000,
    color: 'success'
  })
  await aviso.present()
}

async function redefinir() {
  tocado.value = true
  erroGeral.value = ''
  if (erroCodigo.value || erroSenha.value || erroConfirmacao.value) return

  carregando.value = true
  try {
    await usuario.redefinirSenha(email.value, codigo.value, senha.value)
    const aviso = await toastController.create({
      message: 'Senha redefinida com sucesso.',
      duration: 2500,
      color: 'success'
    })
    await aviso.present()
    router.replace('/home')
  } catch (e: unknown) {
    erroGeral.value =
      e instanceof Error ? e.message : 'Não foi possível redefinir a senha.'
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.fundo {
  --background: rgb(248, 239, 243);
}

.instrucao {
  margin: 0 0 10px;
  text-align: center;
  font-size: 12px;
  line-height: 17px;
  color: #6b6868;
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

.rodape {
  display: flex;
  justify-content: center;
  margin: 14px 0 32px;
}

.rodape ion-button {
  margin-top: 0;
}
</style>
