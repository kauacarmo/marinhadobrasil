import { createClient } from "@supabase/supabase-js"

// Client com service role para operações administrativas (server-side apenas).
// NUNCA importar em componentes cliente.
export function createAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error("Configuração do Supabase não encontrada. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.")
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
