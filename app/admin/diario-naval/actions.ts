"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { dispararWebhooks } from "@/lib/webhooks"
import { CATEGORIAS_NOTICIA } from "@/lib/types"

export async function contarWebhooksDiarioNaval(): Promise<number> {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from("webhooks")
    .select("id", { count: "exact", head: true })
    .eq("aba", "diario_naval")
    .eq("ativo", true)
  return count ?? 0
}

export async function publicarDiarioNaval(formData: FormData) {
  const titulo = String(formData.get("titulo") || "").trim()
  const resumo = String(formData.get("resumo") || "").trim()
  const categoria = String(formData.get("categoria") || "Comunicados").trim()
  const imagem_url = String(formData.get("imagem_url") || "").trim() || null
  const rodape = String(formData.get("rodape") || "").trim() || null
  const mencao = String(formData.get("mencao") || "").trim() || null

  if (!titulo) return { error: "Informe o título da publicação." }
  if (!resumo) return { error: "Informe a descrição da publicação." }
  if (!CATEGORIAS_NOTICIA.includes(categoria as (typeof CATEGORIAS_NOTICIA)[number])) {
    return { error: "Selecione uma categoria válida." }
  }

  const ativos = await contarWebhooksDiarioNaval()
  if (ativos === 0) {
    return {
      error:
        "Nenhum webhook ativo do Diário Naval está configurado. Adicione um em Configurações › Webhooks para publicar no canal.",
    }
  }

  // Publica exclusivamente no canal Diário Naval, via webhook. Não grava no portal.
  await dispararWebhooks("diario_naval", "publicada", {
    titulo,
    resumo,
    categoria,
    data: new Date().toISOString().slice(0, 10),
    imagem_url,
    rodape,
    mencao,
  })

  return { success: true }
}
