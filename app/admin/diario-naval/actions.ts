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

export async function publicarDiarioNaval(formData: FormData) {
  const titulo = String(formData.get("titulo") || "").trim()
  const resumo = String(formData.get("resumo") || "").trim()
  const rodape = String(formData.get("rodape") || "").trim() || null
  const mencao = String(formData.get("mencao") || "").trim() || null

  // Lista de imagens (galeria) enviada como JSON pelo formulário; máximo de 5.
  let imagens: string[] = []
  try {
    const bruto = JSON.parse(String(formData.get("imagens") || "[]"))
    if (Array.isArray(bruto)) {
      imagens = bruto
        .filter((u): u is string => typeof u === "string" && /^https?:\/\//i.test(u.trim()))
        .map((u) => u.trim())
        .slice(0, 5)
    }
  } catch {
    imagens = []
  }

  if (!titulo) return { error: "Informe o título da publicação." }
  if (!resumo) return { error: "Informe a descrição da publicação." }

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
    data: new Date().toISOString().slice(0, 10),
    imagens,
    imagem_url: imagens[0] ?? null,
    rodape,
    mencao,
  })

  return { success: true }
}
