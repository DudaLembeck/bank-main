<template>
  <ion-page>
    <CabecalhoApp />

    <ion-content :fullscreen="true" class="fundo">
      <PilulasNavegacao grupo="simples" />
      <TituloSecao texto="Perfil" />

      <div class="cartao">
        <div class="avatar-area">
          <div class="avatar">
            <img v-if="fotoUrl" :src="fotoUrl" alt="sua foto de perfil" />
            <ion-icon v-else :icon="personCircle" class="avatar-vazio" />
            <div v-if="trocandoFoto" class="avatar-carregando">
              <ion-spinner name="dots" />
            </div>
          </div>

          <ion-chip :color="usuario.ehComissao ? 'tertiary' : 'medium'" class="papel">
            <ion-icon :icon="usuario.ehComissao ? shieldCheckmarkOutline : schoolOutline" />
            <ion-label>{{ usuario.ehComissao ? 'Comissão' : 'Aluno' }}</ion-label>
          </ion-chip>

          <ion-button
            fill="clear"
            size="small"
            class="botao-foto"
            :disabled="trocandoFoto || abrindoCamera"
            @click="trocarFoto"
          >
            <ion-icon slot="start" :icon="cameraOutline" />
            {{ fotoUrl ? 'TROCAR FOTO' : 'ADICIONAR FOTO' }}
          </ion-button>
          <p v-if="erroFoto" class="erro">{{ erroFoto }}</p>
        </div>

        <ion-list lines="none" class="dados">
          <ion-item>
            <ion-label>
              <p>Nome</p>
              <h2>{{ usuario.perfil?.nome ?? '—' }}</h2>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <p>E-mail</p>
              <h2>{{ usuario.email || '—' }}</h2>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <p>Tipo de conta</p>
              <h2>{{ usuario.ehComissao ? 'Comissão' : 'Aluno' }}</h2>
            </ion-label>
          </ion-item>
          <ion-item v-if="usuario.perfil">
            <ion-label>
              <p>Membro desde</p>
              <h2>{{ formatarDataCompleta(usuario.perfil.criado_em) }}</h2>
            </ion-label>
          </ion-item>
        </ion-list>

        <p class="nota">
          Nome e e-mail não podem ser alterados. Só a foto e a senha.
        </p>
      </div>

      <ion-button expand="block" class="botao-senha" @click="abrirSenha">
        <ion-icon slot="start" :icon="keyOutline" />
        REDEFINIR SENHA
      </ion-button>

      <ion-button expand="block" fill="clear" class="sair" @click="encerrarSessao">
        <ion-icon slot="start" :icon="logOutOutline" />
        SAIR
      </ion-button>

      <div class="ancora-modal">
      <ion-modal :is-open="modalSenha" @did-dismiss="fecharSenha">
        <ion-content class="fundo">
          <TituloSecao texto="Redefinir senha" />

          <CartaoFormulario titulo="NOVA SENHA">
            <p class="instrucao">
              Para sua segurança, confirme a senha atual antes de trocar.
            </p>

            <ion-list lines="none">
              <ion-item>
                <ion-input
                  v-model="senhaAtual"
                  type="password"
                  label="senha atual"
                  label-placement="floating"
                  autocomplete="current-password"
                  :error-text="erroSenhaAtual"
                  :class="{ 'ion-invalid ion-touched': tocado && erroSenhaAtual }"
                />
              </ion-item>
              <ion-item>
                <ion-input
                  v-model="novaSenha"
                  type="password"
                  label="nova senha"
                  label-placement="floating"
                  autocomplete="new-password"
                  :error-text="erroNovaSenha"
                  :class="{ 'ion-invalid ion-touched': tocado && erroNovaSenha }"
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
                  @keyup.enter="salvarSenha"
                />
              </ion-item>
            </ion-list>

            <p v-if="erroGeral" class="erro">{{ erroGeral }}</p>

            <ion-button
              expand="block"
              fill="clear"
              :disabled="salvandoSenha"
              @click="salvarSenha"
            >
              <ion-spinner v-if="salvandoSenha" name="dots" />
              <span v-else>SALVAR NOVA SENHA</span>
            </ion-button>

            <ion-button
              expand="block"
              fill="clear"
              :disabled="salvandoSenha"
              @click="fecharSenha"
            >
              cancelar
            </ion-button>
          </CartaoFormulario>
        </ion-content>
      </ion-modal>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  IonButton,
  IonChip,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonSpinner,
  toastController,
  useIonRouter
} from '@ionic/vue'
import {
  cameraOutline,
  keyOutline,
  logOutOutline,
  personCircle,
  schoolOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons'
import CabecalhoApp from '../components/CabecalhoApp.vue'
import CartaoFormulario from '../components/CartaoFormulario.vue'
import PilulasNavegacao from '../components/PilulasNavegacao.vue'
import TituloSecao from '../components/TituloSecao.vue'
import { useCamera } from '../composables/useCamera'
import { formatarDataCompleta } from '../services/data'
import { urlPublica } from '../services/imagemService'
import { atualizarFotoPerfil } from '../services/perfilService'
import { useUsuarioStore } from '../stores/usuario'

const usuario = useUsuarioStore()
const router = useIonRouter()
const { capturar, carregando: abrindoCamera } = useCamera()

const trocandoFoto = ref(false)
const erroFoto = ref('')

const modalSenha = ref(false)
const senhaAtual = ref('')
const novaSenha = ref('')
const confirmacao = ref('')
const tocado = ref(false)
const salvandoSenha = ref(false)
const erroGeral = ref('')

const fotoUrl = computed(() =>
  usuario.perfil?.foto_perfil
    ? urlPublica('perfis', usuario.perfil.foto_perfil)
    : ''
)

const erroSenhaAtual = computed(() =>
  senhaAtual.value ? '' : 'Informe a senha atual.'
)

const erroNovaSenha = computed(() => {
  if (novaSenha.value.length < 6) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }
  if (novaSenha.value === senhaAtual.value) {
    return 'A nova senha precisa ser diferente da atual.'
  }
  return ''
})

const erroConfirmacao = computed(() =>
  confirmacao.value === novaSenha.value ? '' : 'As senhas não são iguais.'
)

async function avisar(mensagem: string, cor: 'success' | 'danger') {
  const aviso = await toastController.create({
    message: mensagem,
    duration: 2500,
    color: cor
  })
  await aviso.present()
}

async function trocarFoto() {
  erroFoto.value = ''
  if (!usuario.perfil) return

  const foto = await capturar()
  if (!foto) return

  trocandoFoto.value = true
  try {
    await atualizarFotoPerfil(
      usuario.perfil.id,
      foto,
      usuario.perfil.foto_perfil
    )
    await usuario.recarregarPerfil()
    await avisar('Foto atualizada.', 'success')
  } catch (e: unknown) {
    erroFoto.value =
      e instanceof Error ? e.message : 'Não foi possível trocar a foto.'
  } finally {
    trocandoFoto.value = false
  }
}

function abrirSenha() {
  senhaAtual.value = ''
  novaSenha.value = ''
  confirmacao.value = ''
  tocado.value = false
  erroGeral.value = ''
  modalSenha.value = true
}

function fecharSenha() {
  modalSenha.value = false
}

async function salvarSenha() {
  tocado.value = true
  erroGeral.value = ''
  if (erroSenhaAtual.value || erroNovaSenha.value || erroConfirmacao.value) {
    return
  }

  salvandoSenha.value = true
  try {
    await usuario.trocarSenha(senhaAtual.value, novaSenha.value)
    modalSenha.value = false
    await avisar('Senha alterada com sucesso.', 'success')
  } catch (e: unknown) {
    erroGeral.value =
      e instanceof Error ? e.message : 'Não foi possível alterar a senha.'
  } finally {
    salvandoSenha.value = false
  }
}

async function encerrarSessao() {
  await usuario.sair()
  router.replace('/login')
}
</script>

<style scoped>
.fundo {
  --background: rgb(248, 239, 243);
}

.cartao {
  margin: 8px 16px 0;
  padding: 22px 16px 14px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(155, 34, 98, 0.12);
}

.avatar-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  position: relative;
  width: 132px;
  height: 132px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--ion-color-primary);
  background: #f3e3ec;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-vazio {
  width: 100%;
  height: 100%;
  color: var(--ion-color-primary-shade);
}

.avatar-carregando {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
}

.papel {
  margin: 12px 0 0;
  font-weight: 700;
}

.botao-foto {
  --color: var(--ion-color-tertiary);
  font-weight: 700;
  letter-spacing: 1px;
  margin: 4px 0 0;
}

.dados {
  margin-top: 8px;
  padding: 0;
  background: transparent;
}

.dados ion-item {
  --background: rgba(251, 183, 219, 0.18);
  --border-radius: 12px;
  --padding-start: 14px;
  margin-bottom: 8px;
}

.dados ion-label p {
  font-size: 11px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a8a8a;
}

.dados ion-label h2 {
  margin-top: 2px;
  font-size: 15px;
  font-weight: 600;
  color: #3d3d3d;
  overflow-wrap: anywhere;
  white-space: normal;
}

.nota {
  margin: 4px 4px 6px;
  text-align: center;
  font-size: 11px;
  color: #9a9a9a;
}

.botao-senha {
  margin: 16px;
  --background: var(--ion-color-tertiary);
  --border-radius: 14px;
  font-weight: 700;
  letter-spacing: 1px;
}

.sair {
  --color: var(--ion-color-tertiary);
  margin: 0 16px 32px;
  font-weight: 700;
  letter-spacing: 1px;
}

.instrucao {
  margin: 0 0 10px;
  text-align: center;
  font-size: 12px;
  line-height: 17px;
  color: #6b6868;
}

.erro {
  font-size: 13px;
  text-align: center;
  color: var(--ion-color-danger);
}

ion-modal ion-button {
  --color: var(--ion-color-tertiary);
  font-weight: 700;
  letter-spacing: 1px;
}
</style>
