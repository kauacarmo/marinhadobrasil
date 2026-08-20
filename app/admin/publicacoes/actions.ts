"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Publicacao, TipoPublicacao } from "@/lib/types"
import { dispararWebhooks } from "@/lib/webhooks"

export async function listPublicacoes(tipo: TipoPublicacao): Promise<Publicacao[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("publicacoes")
    .select("*, contests(titulo)")
    .eq("tipo", tipo)
    .order("data_evento", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return data.map((row: any) => ({
    id: row.id,
    tipo: row.tipo,
    contest_id: row.contest_id,
    titulo: row.titulo,
    descricao: row.descricao,
    pdf_url: row.pdf_url,
    data_evento: row.data_evento,
    created_at: row.created_at,
    concurso_titulo: row.contests?.titulo ?? null,
  }))
}

export async function listConcursosSelect(): Promise<{ id: string; titulo: string }[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("contests").select("id, titulo").order("created_at", { ascending: false })
  if (error || !data) return []
  return data
}

export async function criarPublicacao(formData: FormData) {
  const tipo = String(formData.get("tipo") || "") as TipoPublicacao
  const titulo = String(formData.get("titulo") || "").trim()
  if (!tipo || !titulo) return { error: "Preencha o título." }

  const supabase = createAdminClient()
  const { data: nova, error } = await supabase
    .from("publicacoes")
    .insert({
      tipo,
      titulo,
      contest_id: String(formData.get("contest_id") || "").trim() || null,
      descricao: String(formData.get("descricao") || "").trim() || null,
      pdf_url: String(formData.get("pdf_url") || "").trim() || null,
      data_evento: String(formData.get("data_evento") || "").trim() || null,
    })
    .select()
    .single()
  if (error) return { error: error.message }

  await dispararWebhooks("publicacoes", tipo, nova)

  revalidatePath("/admin/publicacoes")
  revalidatePath("/resultados")
  revalidatePath("/editais")
  revalidatePath("/cronogramas")
  return { success: true }
}

export async function apagarPublicacao(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("publicacoes").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/admin/publicacoes")
  revalidatePath("/resultados")
  revalidatePath("/editais")
  revalidatePath("/cronogramas")
  return { success: true }
}
