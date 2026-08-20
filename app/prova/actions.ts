"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import type { Contest, Exam, Registration } from "@/lib/types"

// Questão exposta ao candidato (sem gabarito)
export type QuestaoPublica = {
  enunciado: string
  alternativas: string[]
}

export type AcessoProvaOk = {
  ok: true
  candidato: string
  concurso: string
  examId: string
  contestId: string
  duracaoMinutos: number
  questoes: QuestaoPublica[]
}
export type AcessoProvaErro = { ok: false; error: string }

export async function acessarProva(codigoRaw: string): Promise<AcessoProvaOk | AcessoProvaErro> {
  const codigo = codigoRaw.trim().toUpperCase()
  if (!codigo) return { ok: false, error: "Informe o código recebido na inscrição." }

  const supabase = createAdminClient()

  const { data: reg } = await supabase
    .from("registrations")
    .select("*")
    .eq("codigo_prova", codigo)
    .single()

  if (!reg) return { ok: false, error: "Código inválido. Verifique o código recebido na inscrição." }
  const registration = reg as Registration

  const { data: contestData } = await supabase
    .from("contests")
    .select("*")
    .eq("id", registration.contest_id)
    .single()
  const contest = contestData as Contest | null
  if (!contest) return { ok: false, error: "Concurso não encontrado." }

  if (contest.status !== "em_andamento") {
    return {
      ok: false,
      error: "A prova ainda não foi liberada. Ela ficará disponível quando o concurso estiver Em Andamento.",
    }
  }

  const { data: examData } = await supabase
    .from("exams")
    .select("*")
    .eq("contest_id", contest.id)
    .single()
  const exam = examData as Exam | null

  if (!exam) return { ok: false, error: "A prova deste concurso ainda não foi gerada." }
  if (!exam.liberada) {
    return { ok: false, error: "A prova ainda não foi liberada pela administração." }
  }

  return {
    ok: true,
    candidato: registration.nome,
    concurso: contest.titulo,
    examId: exam.id,
    contestId: contest.id,
    duracaoMinutos: exam.duracao_minutos ?? 60,
    // Remove o gabarito antes de enviar ao cliente
    questoes: exam.questoes.map((q) => ({ enunciado: q.enunciado, alternativas: q.alternativas })),
  }
}

export async function enviarRespostas(examId: string, respostas: number[]) {
  const supabase = createAdminClient()
  const { data: examData } = await supabase.from("exams").select("*").eq("id", examId).single()
  const exam = examData as Exam | null
  if (!exam) return { error: "Prova não encontrada." }

  let acertos = 0
  const gabarito = exam.questoes.map((q, i) => {
    const correta = q.correta
    const marcada = respostas[i]
    const certo = marcada === correta
    if (certo) acertos++
    return { correta, marcada, certo }
  })

  return {
    success: true,
    acertos,
    total: exam.questoes.length,
    gabarito,
  }
}
