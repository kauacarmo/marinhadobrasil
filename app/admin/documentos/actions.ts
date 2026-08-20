"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Documento, TipoDocumento } from "@/lib/types"

const PATHS: Record<TipoDocumento, string> = {
  portaria: "/admin/portarias",
  boletim: "/admin/boletim",
  disciplinar: "/admin/disciplinar",
}

export async function listDocumentos(tipo: TipoDocumento): Promise<Documento[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("tipo", tipo)
    .order("created_at", { ascending: false })
  if (error) return []
  return (data ?? []) as Documento[]
}

export async function getDocumento(id: string): Promise<Documento | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("documents").select("*").eq("id", id).single()
  if (error) return null
  return data as Documento
}

export async function criarDocumento(tipo: TipoDocumento, formData: FormData) {
  const titulo = String(formData.get("titulo") || "").trim()
  const numero = String(formData.get("numero") || "").trim() || null
  const conteudo = String(formData.get("conteudo") || "").trim() || null
  const pdfUrl = String(formData.get("pdf_url") || "").trim() || null

  if (!titulo) return { error: "Informe o título do documento." }
  if (!conteudo && !pdfUrl) return { error: "Informe o texto ou o link do PDF." }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("documents")
    .insert({ tipo, titulo, numero, conteudo, pdf_url: pdfUrl, origem: "manual" })
  if (error) return { error: error.message }

  revalidatePath(PATHS[tipo])
  return { success: true }
}

export async function apagarDocumento(id: string, tipo: TipoDocumento) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("documents").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(PATHS[tipo])
  return { success: true }
}
