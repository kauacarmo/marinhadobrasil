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
  codigo: string
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

  // Antifraude: candidato já desclassificado por cola não acessa novamente.
  if (registration.desclassificado) {
    return {
      ok: false,
      error:
        "Você foi DESCLASSIFICADO por quebra das regras da prova (cola). O acesso a esta prova está permanentemente bloqueado.",
    }
  }

  // Antifraude: prova já finalizada não pode ser refeita.
  if (registration.prova_finalizada_em) {
    return { ok: false, error: "Esta prova já foi finalizada e não pode ser refeita." }
  }

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
    codigo,
    duracaoMinutos: exam.duracao_minutos ?? 60,
    // Remove o gabarito antes de enviar ao cliente
    questoes: exam.questoes.map((q) => ({ enunciado: q.enunciado, alternativas: q.alternativas })),
  }
}

// Antifraude: registra a desclassificação por cola (saída da tela / troca de janela).
export async function desclassificarProva(codigoRaw: string, motivo: string) {
  const codigo = (codigoRaw || "").trim().toUpperCase()
  if (!codigo) return { error: "Código ausente." }

  const supabase = createAdminClient()
  const { data: reg } = await supabase
    .from("registrations")
    .select("id, desclassificado")
    .eq("codigo_prova", codigo)
    .single()

  if (!reg) return { error: "Inscrição não encontrada." }
  // Já desclassificado: mantém o primeiro registro.
  if ((reg as { desclassificado: boolean }).desclassificado) return { success: true }

  await supabase
    .from("registrations")
    .update({
      desclassificado: true,
      motivo_desclassificacao: motivo?.slice(0, 200) || "Cola detectada durante a prova.",
      desclassificado_em: new Date().toISOString(),
      prova_finalizada_em: new Date().toISOString(),
      acertos: 0,
    })
    .eq("codigo_prova", codigo)

  return { success: true }
}

export async function enviarRespostas(examId: string, respostas: number[], codigo?: string) {
  const supabase = createAdminClient()

  // Antifraude: não aceita respostas de candidato desclassificado.
  if (codigo) {
    const { data: reg } = await supabase
      .from("registrations")
      .select("desclassificado")
      .eq("codigo_prova", codigo.trim().toUpperCase())
      .single()
    if (reg && (reg as { desclassificado: boolean }).desclassificado) {
      return { error: "Você foi desclassificado por cola. As respostas não serão computadas." }
    }
  }

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

  const total = exam.questoes.length

  // Persiste a nota na inscrição do candidato para consulta no painel
  if (codigo) {
    await supabase
      .from("registrations")
      .update({
        acertos,
        total_questoes: total,
        respostas,
        prova_finalizada_em: new Date().toISOString(),
      })
      .eq("codigo_prova", codigo.trim().toUpperCase())
  }

  return {
    success: true,
    acertos,
    total,
    gabarito,
  }
}
