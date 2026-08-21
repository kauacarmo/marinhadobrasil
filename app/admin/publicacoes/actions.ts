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

export type CandidatoDesempenho = {
  id: string
  numero_inscricao: string
  nome: string
  acertos: number
  total: number
  percentual: number
  finalizadaEm: string | null
  posicao: number
  aprovado: boolean
  desclassificado: boolean
  motivoDesclassificacao: string | null
}

export type DesempenhoConcurso = {
  contest: { id: string; titulo: string; cargo: string; vagas: number }
  candidatos: CandidatoDesempenho[]
  totalRealizaram: number
  aprovados: number
}

export async function listConcursosComDesempenho(): Promise<
  { id: string; titulo: string; cargo: string; realizaram: number }[]
> {
  const supabase = createAdminClient()
  const { data: contests } = await supabase
    .from("contests")
    .select("id, titulo, cargo")
    .order("created_at", { ascending: false })
  if (!contests) return []

  const { data: regs } = await supabase
    .from("registrations")
    .select("contest_id")
    .not("prova_finalizada_em", "is", null)

  const contagem: Record<string, number> = {}
  for (const r of regs ?? []) contagem[r.contest_id] = (contagem[r.contest_id] ?? 0) + 1

  return (contests as any[]).map((c) => ({
    id: c.id,
    titulo: c.titulo,
    cargo: c.cargo,
    realizaram: contagem[c.id] ?? 0,
  }))
}

// Nota mínima de aprovação (aproveitamento) — usada como critério de sugestão
const APROVEITAMENTO_MINIMO = 50

export async function getDesempenhoConcurso(contestId: string): Promise<DesempenhoConcurso | null> {
  const supabase = createAdminClient()

  const { data: contest } = await supabase
    .from("contests")
    .select("id, titulo, cargo, vagas")
    .eq("id", contestId)
    .single()
  if (!contest) return null

  const { data: regs } = await supabase
    .from("registrations")
    .select(
      "id, numero_inscricao, nome, nome_personagem, acertos, total_questoes, prova_finalizada_em, desclassificado, motivo_desclassificacao",
    )
    .eq("contest_id", contestId)
    .not("prova_finalizada_em", "is", null)

  const vagas = (contest as any).vagas ?? 0

  // Ordena pela maior nota (aproveitamento), depois pela conclusão mais cedo.
  // Desclassificados por cola vão sempre para o fim da lista.
  const ordenados = (regs ?? [])
    .map((r: any) => {
      const total = r.total_questoes ?? 0
      const acertos = r.acertos ?? 0
      const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0
      return {
        id: r.id,
        numero_inscricao: r.numero_inscricao,
        nome: r.nome_personagem || r.nome,
        acertos,
        total,
        percentual,
        finalizadaEm: r.prova_finalizada_em,
        desclassificado: !!r.desclassificado,
        motivoDesclassificacao: r.motivo_desclassificacao ?? null,
      }
    })
    .sort((a, b) => {
      if (a.desclassificado !== b.desclassificado) return a.desclassificado ? 1 : -1
      if (b.percentual !== a.percentual) return b.percentual - a.percentual
      return (a.finalizadaEm ?? "").localeCompare(b.finalizadaEm ?? "")
    })

  // Sugestão de aprovação: dentro do número de vagas, com aproveitamento mínimo e não desclassificado.
  let aprovados = 0
  const candidatos: CandidatoDesempenho[] = ordenados.map((c, i) => {
    const dentroVagas = vagas > 0 ? i < vagas : true
    const aprovado = !c.desclassificado && dentroVagas && c.percentual >= APROVEITAMENTO_MINIMO
    if (aprovado) aprovados++
    return { ...c, posicao: i + 1, aprovado }
  })

  return {
    contest: { id: contest.id, titulo: contest.titulo, cargo: contest.cargo, vagas },
    candidatos,
    totalRealizaram: candidatos.length,
    aprovados,
  }
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
