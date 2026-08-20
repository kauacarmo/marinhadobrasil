import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import type { AbaWebhook } from "@/lib/types"

/**
 * Dispara os webhooks ativos de uma aba, enviando um POST com o evento e os dados.
 * Falhas de entrega são registradas no log, mas nunca interrompem a operação principal.
 */
export async function dispararWebhooks(aba: AbaWebhook, evento: string, dados: unknown) {
  try {
    const supabase = createAdminClient()
    const { data: webhooks } = await supabase
      .from("webhooks")
      .select("id, url")
      .eq("aba", aba)
      .eq("ativo", true)

    if (!webhooks || webhooks.length === 0) return

    const payload = JSON.stringify({
      aba,
      evento,
      dados,
      enviado_em: new Date().toISOString(),
    })

    await Promise.allSettled(
      webhooks.map((w) =>
        fetch(w.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Aba": aba,
            "X-Webhook-Evento": evento,
          },
          body: payload,
        }).catch((err) => {
          console.log("[v0] Falha ao entregar webhook:", w.url, String(err))
        }),
      ),
    )
  } catch (err) {
    console.log("[v0] Erro no disparo de webhooks:", String(err))
  }
}
