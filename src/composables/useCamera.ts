import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { toastController } from '@ionic/vue'

export function useCamera() {
  const fotoSrc = ref<string | null>(null)
  const carregando = ref(false)

  async function capturar(
    source: CameraSource = CameraSource.Prompt
  ): Promise<string | null> {
    carregando.value = true
    try {
      const foto = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source,
        quality: 85,
        width: 1000,
        webUseInput: Capacitor.getPlatform() === 'web'
      })
      fotoSrc.value = foto.dataUrl ?? null
      return fotoSrc.value
    } catch (e: unknown) {
      const mensagem = String(e).toLowerCase()
      if (mensagem.includes('cancel') || mensagem.includes('no image')) {
        return null
      }
      const aviso = await toastController.create({
        message: 'Não foi possível acessar a câmera ou as fotos.',
        duration: 2500,
        color: 'danger'
      })
      await aviso.present()
      return null
    } finally {
      carregando.value = false
    }
  }

  return { fotoSrc, carregando, capturar }
}
