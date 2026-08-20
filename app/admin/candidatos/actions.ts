"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import type { Exam, Registration } from "@/lib/types"

export type CandidatoComConcurso = Registration & { concurso_titulo: string }

export type QuestaoCorrigida = {
  enunciado: string
  alternativas: string[]
  correta: number
  marcada: number | null
  certo: boolean
}

export type ProvaCandidato = {
  candidato: string
  concurso: string
  acertos: number
  total: number
  finalizadaEm: string | null
  questoes: QuestaoCorrigida[]
}

// Carrega a prova respondida por um candidato, com gabarito e alternativa marcada
export async function getProvaCandidato(
  registrationId: string,
): Promise<{ prova?: ProvaCandidato; error?: string }> {
  const supabase = createAdminClient()

  const { data: reg } = await supabase
    .from("registrations")
    .select("*, contests(titulo)")
    .eq("id", registrationId)
    .single()
  if (!reg) return { error: "Candidato não encontrado." }
  const registro = reg as any

  if (!registro.prova_finalizada_em) {
    return { error: "Este candidato ainda não realizou a prova." }
  }

  const { data: examData } = await supabase
    .from("exams")
    .select("*")
    .eq("contest_id", registro.contest_id)
    .single()
  const exam = examData as Exam | null
  if (!exam) return { error: "A prova deste concurso não está mais disponível." }

  const respostas: number[] = Array.isArray(registro.respostas) ? registro.respostas : []

  const questoes: QuestaoCorrigida[] = exam.questoes.map((q, i) => {
    const marcada = respostas[i] ?? null
    return {
      enunciado: q.enunciado,
      alternativas: q.alternativas,
      correta: q.correta,
      marcada,
      certo: marcada === q.correta,
    }
  })

  return {
    prova: {
      candidato: registro.nome_personagem || registro.nome,
      concurso: registro.contests?.titulo ?? "—",
      acertos: registro.acertos ?? questoes.filter((q) => q.certo).length,
      total: registro.total_questoes ?? questoes.length,
      finalizadaEm: registro.prova_finalizada_em,
      questoes,
    },
  }
}

export async function listCandidatos(): Promise<CandidatoComConcurso[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("registrations")
    .select("*, contests(titulo)")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r: any) => ({
    ...r,
    concurso_titulo: r.contests?.titulo ?? "—",
  })) as CandidatoComConcurso[]
}

export async function editarCandidato(id: string, formData: FormData) {
  const nome = String(formData.get("nome") || "").trim()
  const id_jogo = String(formData.get("id_jogo") || "").trim()
  const nome_personagem = String(formData.get("nome_personagem") || "").trim()
  const idade = Number(formData.get("idade"))
  const data_nascimento = String(formData.get("data_nascimento") || "").trim()

  if (!nome) return { error: "Informe o nome do candidato." }
  if (!Number.isInteger(idade) || idade <= 0 || idade >= 130) {
    return { error: "Informe uma idade válida." }
  }
  if (!data_nascimento) return { error: "Informe a data de nascimento." }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("registrations")
    .update({ nome, id_jogo: id_jogo || null, nome_personagem: nome_personagem || null, idade, data_nascimento })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/candidatos")
  return { success: true }
}

export async function apagarCandidato(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("registrations").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/candidatos")
  return { success: true }
}

// Limpar TODOS os candidatos/inscrições do sistema
export async function limparTodos() {
  const supabase = createAdminClient()
  const { error } = await supabase.from("registrations").delete().not("id", "is", null)
  if (error) return { error: error.message }
  revalidatePath("/admin/candidatos")
  return { success: true }
}
