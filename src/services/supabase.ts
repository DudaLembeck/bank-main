import { createClient } from '@supabase/supabase-js'
import { Preferences } from '@capacitor/preferences'

const url = import.meta.env.VITE_SUPABASE_URL
const chaveAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !chaveAnon) {
  throw new Error(
    'Faltam VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
  )
}

const armazenamentoSessao = {
  async getItem(chave: string) {
    const { value } = await Preferences.get({ key: chave })
    return value
  },
  async setItem(chave: string, valor: string) {
    await Preferences.set({ key: chave, value: valor })
  },
  async removeItem(chave: string) {
    await Preferences.remove({ key: chave })
  }
}

export const supabase = createClient(url, chaveAnon, {
  auth: {
    storage: armazenamentoSessao,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})
