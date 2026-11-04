<template>
  <ion-page>
    <MarcaTopo />

    <ion-content :fullscreen="true" class="fundo">
      <TituloSecao texto="Crie sua conta" />

      <div class="seletor">
        <ion-button
          :fill="modo === 'aluno' ? 'solid' : 'outline'"
          size="small"
          @click="modo = 'aluno'"
        >
          ALUNO
        </ion-button>
        <ion-button
          :fill="modo === 'comissao' ? 'solid' : 'outline'"
          size="small"
          @click="modo = 'comissao'"
        >
          COMISSÃO
        </ion-button>
      </div>

      <p class="explicacao">
        {{
          modo === 'aluno'
            ? 'Conta de aluno: vê o caixa, publica posts e fotos.'
            : 'Conta da comissão: movimenta o caixa e publica avisos. Exige o código da comissão.'
        }}
      </p>

      <CartaoFormulario titulo="SUAS INFORMAÇÕES">
        <ion-list lines="none" class="campos">
          <ion-item>
            <ion-input
              v-model="nomeCompleto"
              label="nome completo"
              label-placement="floating"
              autocomplete="name"
              :clear-input="true"
              :error-text="erroNomeCompleto"
              :class="{ 'ion-invalid ion-touched': tocado && erroNomeCompleto }"
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model="senha"
              type="password"
              label="senha"
              label-placement="floating"
              autocomplete="new-password"
              :error-text="erroSenha"
              :class="{ 'ion-invalid ion-touched': tocado && erroSenha }"
            />
          </ion-item>

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

          <ion-item v-if="modo === 'comissao'">
            <ion-input
              v-model="codigo"
              type="password"
              label="código da comissão"
              label-placement="floating"
              :error-text="erroCodigo"
              :class="{ 'ion-invalid ion-touched': tocado && erroCodigo }"
              @keyup.enter="criarConta"
            />
          </ion-item>
        </ion-list>

        <p v-if="erroGeral" class="erro-geral">{{ erroGeral }}</p>

        <ion-button
          expand="block"
          fill="clear"
          :disabled="carregando"
          @click="criarConta"
        >
          <ion-spinner v-if="carregando" name="dots" />
          <span v-else>CRIAR CONTA</span>
        </ion-button>
      </CartaoFormulario>

      <div class="rodape">
        <span>já tem conta?</span>
        <ion-button fill="clear" size="small" router-link="/login">
          entrar
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
  alertController,
  useIonRouter
} from '@ionic/vue'
import CartaoFormulario from '../components/CartaoFormulario.vue'
import MarcaTopo from '../components/MarcaTopo.vue'
import TituloSecao from '../components/TituloSecao.vue'
import { useUsuarioStore } from '../stores/usuario'

const router = useIonRouter()
const usuario = useUsuarioStore()

const modo = ref<'aluno' | 'comissao'>('aluno')
const nomeCompleto = ref('')
const email = ref('')
const senha = ref('')
const codigo = ref('')
const tocado = ref(false)
const carregando = ref(false)
const erroGeral = ref('')

const erroNomeCompleto = computed(() => {
  const valor = nomeCompleto.value.trim().replace(/\s+/g, ' ')
  if (!valor) return 'Informe seu nome completo.'
  if (valor.length < 2 || valor.length > 80) return 'Use de 2 a 80 caracteres.'
  if (!valor.includes(' ')) return 'Informe nome e sobrenome.'
  if (!/^[A-Za-zÀ-ÿ' -]+$/.test(valor)) {
    return 'Use apenas letras, espaços, hífen e apóstrofo.'
  }
  return ''
})

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

const erroCodigo = computed(() => {
  if (modo.value !== 'comissao') return ''
  return codigo.value.trim() ? '' : 'Informe o código da comissão.'
})

const formularioValido = computed(
  () =>
    !erroNomeCompleto.value &&
    !erroEmail.value &&
    !erroSenha.value &&
    !erroCodigo.value
)

async function avisar(header: string, message: string) {
  const aviso = await alertController.create({
    header,
    message,
    buttons: ['Entendi']
  })
  await aviso.present()
  await aviso.onDidDismiss()
}

async function criarConta() {
  tocado.value = true
  erroGeral.value = ''
  if (!formularioValido.value) return

  carregando.value = true
  try {
    const { entrouDireto, virouComissao } = await usuario.cadastrar(
      nomeCompleto.value,
      email.value,
      senha.value,
      modo.value === 'comissao' ? codigo.value : undefined
    )

    if (!entrouDireto) {
      await avisar(
        'Confirme seu e-mail',
        'Enviamos um link de confirmação para ' +
          email.value.trim() +
          '. Abra o link e depois entre no app.'
      )
      router.replace('/login')
      return
    }

    if (modo.value === 'comissao' && !virouComissao) {
      await avisar(
        'Código inválido',
        'A conta foi criada como aluno porque o código da comissão não confere. Peça para alguém da comissão te promover.'
      )
    }

    router.replace('/home')
  } catch (e: unknown) {
    erroGeral.value =
      e instanceof Error ? e.message : 'Não foi possível criar a conta.'
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.fundo {
  --background: rgb(248, 239, 243);
}

.seletor {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 0 16px;
}

.seletor ion-button {
  --color: var(--ion-color-tertiary);
  --border-color: var(--ion-color-tertiary);
  font-weight: 700;
  letter-spacing: 1px;
  min-width: 120px;
}

.explicacao {
  margin: 10px 24px 0;
  text-align: center;
  font-size: 12px;
  line-height: 17px;
  color: #8c8c8c;
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
