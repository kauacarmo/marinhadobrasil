"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { dispararWebhooks } from "@/lib/webhooks"
import type { DestinoNoticia, Noticia } from "@/lib/types"

export async function listNoticias(): Promise<Noticia[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("noticias")
    .select("*")
    .order("data", { ascending: false })
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Noticia[]
}

export async function criarNoticia(formData: FormData) {
  const titulo = String(formData.get("titulo") || "").trim()
  const resumo = String(formData.get("resumo") || "").trim()
  const categoria = String(formData.get("categoria") || "Comunicados").trim()
  const data = String(formData.get("data") || "").trim()
  const destino = String(formData.get("destino") || "portal").trim() as DestinoNoticia
  const imagem_url = String(formData.get("imagem_url") || "").trim() || null
  const rodape = String(formData.get("rodape") || "").trim() || null
  const mencao = String(formData.get("mencao") || "").trim() || null

  if (!titulo) return { error: "Informe o título da publicação." }
  if (!resumo) return { error: "Informe o resumo da publicação." }
  if (!["portal", "diario_naval", "ambos"].includes(destino)) {
    return { error: "Selecione um destino válido." }
  }

  const dataPublicacao = data || new Date().toISOString().slice(0, 10)
  const supabase = createAdminClient()

  const payloadWebhook = { titulo, resumo, categoria, data: dataPublicacao, imagem_url, rodape, mencao }

  // Grava no portal apenas quando o destino inclui o site
  if (destino === "portal" || destino === "ambos") {
    const { error } = await supabase
      .from("noticias")
      .insert({ titulo, resumo, categoria, data: dataPublicacao, destino, imagem_url, rodape, mencao })
    if (error) return { error: error.message }
    await dispararWebhooks("noticias", "publicada", payloadWebhook)
  }

  // Dispara o canal Diário Naval quando incluído no destino
  if (destino === "diario_naval" || destino === "ambos") {
    await dispararWebhooks("diario_naval", "publicada", payloadWebhook)
  }

  revalidatePath("/admin/noticias")
  revalidatePath("/noticias")
  return { success: true }
}

export async function editarNoticia(id: string, formData: FormData) {
  const titulo = String(formData.get("titulo") || "").trim()
  const resumo = String(formData.get("resumo") || "").trim()
  const categoria = String(formData.get("categoria") || "Comunicados").trim()
  const data = String(formData.get("data") || "").trim()

  if (!titulo) return { error: "Informe o título da publicação." }
  if (!resumo) return { error: "Informe o resumo da publicação." }

  const imagem_url = String(formData.get("imagem_url") || "").trim() || null
  const rodape = String(formData.get("rodape") || "").trim() || null
  const mencao = String(formData.get("mencao") || "").trim() || null

  const supabase = createAdminClient()
  const patch: Record<string, unknown> = { titulo, resumo, categoria, imagem_url, rodape, mencao }
  if (data) patch.data = data
  const { error } = await supabase.from("noticias").update(patch).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/admin/noticias")
  revalidatePath("/noticias")
  return { success: true }
}

export async function apagarNoticia(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("noticias").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/noticias")
  revalidatePath("/noticias")
  return { success: true }
}
