"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { dispararWebhooks } from "@/lib/webhooks"

export async function contarWebhooksDiarioNaval(): Promise<number> {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from("webhooks")
    .select("id", { count: "exact", head: true })
    .eq("aba", "diario_naval")
    .eq("ativo", true)
  return count ?? 0
}

type BlocoEntrada = { tipo?: string; texto?: string; url?: string }
type NoticiaEntrada = { titulo?: string; mencao?: string; rodape?: string; blocos?: BlocoEntrada[] }

// Limites alinhados ao Discord (até 10 embeds por mensagem = manchete + 9 blocos).
const MAX_BLOCOS = 9
const MAX_NOTICIAS = 10

export async function publicarDiarioNaval(formData: FormData) {
  let entradas: NoticiaEntrada[] = []
  try {
    const bruto = JSON.parse(String(formData.get("noticias") || "[]"))
    if (Array.isArray(bruto)) entradas = bruto as NoticiaEntrada[]
  } catch {
    entradas = []
  }

  // Sanitiza cada notícia e seus blocos, preservando a ordem definida no editor.
  const noticias = entradas
    .map((n) => {
      const blocos = (Array.isArray(n?.blocos) ? n.blocos : [])
        .map((b) =>
          b?.tipo === "imagem"
            ? { tipo: "imagem" as const, url: String(b.url || "").trim() }
            : { tipo: "texto" as const, texto: String(b.texto || "").trim() },
        )
        .filter((b) => (b.tipo === "imagem" ? /^https?:\/\//i.test(b.url) : b.texto.length > 0))
        .slice(0, MAX_BLOCOS)
      return {
        titulo: String(n?.titulo || "").trim(),
        mencao: String(n?.mencao || "").trim() || null,
        rodape: String(n?.rodape || "").trim() || null,
        blocos,
      }
    })
    .filter((n) => n.titulo && n.blocos.length > 0)
    .slice(0, MAX_NOTICIAS)

  if (noticias.length === 0) {
    return { error: "Adicione ao menos uma notícia com manchete e pelo menos um bloco de conteúdo." }
  }

  const ativos = await contarWebhooksDiarioNaval()
  if (ativos === 0) {
    return {
      error:
        "Nenhum webhook ativo do Diário Naval está configurado. Adicione um em Configurações › Webhooks para publicar no canal.",
    }
  }

  // Cada notícia vira uma mensagem separada no canal, na ordem em que foi montada.
  for (const n of noticias) {
    await dispararWebhooks("diario_naval", "publicada", {
      titulo: n.titulo,
      mencao: n.mencao,
      rodape: n.rodape,
      blocos: n.blocos,
      data: new Date().toISOString().slice(0, 10),
    })
  }

  return { success: true, total: noticias.length }
}
