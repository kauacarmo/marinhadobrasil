"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Curso, CursoComVagas, CursoInscricao } from "@/lib/types"

export async function listCursos(): Promise<CursoComVagas[]> {
  const supabase = createAdminClient()
  const { data: cursos } = await supabase.from("cursos").select("*").order("created_at", { ascending: false })
  if (!cursos) return []

  const { data: inscricoes } = await supabase.from("curso_inscricoes").select("curso_id")
  const contagem = new Map<string, number>()
  for (const i of inscricoes ?? []) {
    contagem.set(i.curso_id, (contagem.get(i.curso_id) ?? 0) + 1)
  }

  return (cursos as Curso[]).map((c) => ({ ...c, inscritos: contagem.get(c.id) ?? 0 }))
}

export async function listInscritosCurso(cursoId: string): Promise<CursoInscricao[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("curso_inscricoes")
    .select("*")
    .eq("curso_id", cursoId)
    .order("created_at", { ascending: true })
  return (data as CursoInscricao[]) ?? []
}

function extrairCampos(formData: FormData) {
  return {
    titulo: String(formData.get("titulo") || "").trim(),
    descricao: String(formData.get("descricao") || "").trim() || null,
    carga_horaria: String(formData.get("carga_horaria") || "").trim() || null,
    instrutor: String(formData.get("instrutor") || "").trim() || null,
    modalidade: String(formData.get("modalidade") || "").trim() || null,
    local: String(formData.get("local") || "").trim() || null,
    vagas: Number.parseInt(String(formData.get("vagas") || "0"), 10) || 0,
    inscricoes_inicio: String(formData.get("inscricoes_inicio") || "").trim() || null,
    inscricoes_fim: String(formData.get("inscricoes_fim") || "").trim() || null,
  }
}

type ResultadoUpload = { ok: true; url: string | null } | { ok: false; error: string }

async function uploadImagem(
  supabase: ReturnType<typeof createAdminClient>,
  id: string,
  formData: FormData,
): Promise<ResultadoUpload> {
  const imagem = formData.get("imagem") as File | null
  if (imagem && typeof imagem === "object" && imagem.size > 0) {
    const ext = imagem.name.split(".").pop()?.toLowerCase() || "png"
    const caminho = `${id}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from("cursos")
      .upload(caminho, imagem, { contentType: imagem.type, upsert: true })
    if (upErr) return { ok: false, error: `Falha no upload da imagem: ${upErr.message}` }
    const { data: pub } = supabase.storage.from("cursos").getPublicUrl(caminho)
    return { ok: true, url: pub.publicUrl }
  }
  const imageUrl = String(formData.get("image_url") || "").trim()
  return { ok: true, url: imageUrl || null }
}

export async function criarCurso(formData: FormData) {
  const campos = extrairCampos(formData)
  if (!campos.titulo) return { error: "Informe o título do curso." }

  const supabase = createAdminClient()
  const { data, error } = await supabase.from("cursos").insert(campos).select("id").single()
  if (error || !data) return { error: error?.message || "Não foi possível criar o curso." }

  const img = await uploadImagem(supabase, data.id, formData)
  if (!img.ok) return { error: img.error }
  if (img.url) await supabase.from("cursos").update({ image_url: img.url }).eq("id", data.id)

  revalidatePath("/admin/cursos")
  revalidatePath("/area-candidato")
  return { success: true }
}

export async function editarCurso(id: string, formData: FormData) {
  const campos = extrairCampos(formData)
  if (!campos.titulo) return { error: "Informe o título do curso." }

  const supabase = createAdminClient()
  const patch: Record<string, unknown> = { ...campos }

  const img = await uploadImagem(supabase, id, formData)
  if (!img.ok) return { error: img.error }
  if (img.url) patch.image_url = img.url

  const { error } = await supabase.from("cursos").update(patch).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/admin/cursos")
  revalidatePath("/area-candidato")
  return { success: true }
}

export async function alternarPublicacaoCurso(id: string, publicado: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("cursos").update({ publicado }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/cursos")
  revalidatePath("/area-candidato")
  return { success: true }
}

export async function apagarCurso(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("cursos").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/cursos")
  revalidatePath("/area-candidato")
  return { success: true }
}
