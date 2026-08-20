import { createClient } from "@supabase/supabase-js"

// Client com service role para operações administrativas (server-side apenas).
// NUNCA importar em componentes cliente.
export function createAdminClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
