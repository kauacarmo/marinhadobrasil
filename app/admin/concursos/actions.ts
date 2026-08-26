"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { generateObject } from "ai"
import { z } from "zod"
import type { Contest, ContestStatus, Exam, Questao } from "@/lib/types"
import { gerarProvaFallback } from "@/lib/banco-questoes"
import { dispararWebhooks } from "@/lib/webhooks"

export async function listContests(): Promise<(Contest & { inscritos: number; temProva: boolean })[]> {
  const supabase = createAdminClient()
  const { data: contests, error } = await supabase
    .from("contests")
    .select("*")
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)

  const { data: regs } = await supabase.from("registrations").select("contest_id")
  const { data: exams } = await supabase.from("exams").select("contest_id")

  const contagem: Record<string, number> = {}
  for (const r of regs ?? []) contagem[r.contest_id] = (contagem[r.contest_id] ?? 0) + 1
  const comProva = new Set((exams ?? []).map((e) => e.contest_id))

  return (contests as Contest[]).map((c) => ({
    ...c,
    inscritos: contagem[c.id] ?? 0,
    temProva: comProva.has(c.id),
  }))
}

export async function criarContest(formData: FormData) {
  const titulo = String(formData.get("titulo") || "").trim()
  const cargo = String(formData.get("cargo") || "").trim()
  const vagas = Number.parseInt(String(formData.get("vagas") || "0"), 10) || 0
  const descricao = String(formData.get("descricao") || "").trim()
  const tema = String(formData.get("tema_prova") || "").trim()

  if (!titulo || !cargo) return { error: "Preencha título e cargo." }

  const supabase = createAdminClient()
  const { data: novo, error } = await supabase
    .from("contests")
    .insert({
      titulo,
      cargo,
      vagas,
      descricao,
      tema_prova: tema || "Conhecimentos gerais e legislação marítima",
      status: "fechado",
    })
    .select()
    .single()
  if (error) return { error: error.message }
  await dispararWebhooks("concursos", "criado", novo)
  revalidatePath("/admin/concursos")
  revalidatePath("/")
  return { success: true }
}

export async function atualizarContest(id: string, formData: FormData) {
  const titulo = String(formData.get("titulo") || "").trim()
  const cargo = String(formData.get("cargo") || "").trim()
  if (!titulo || !cargo) return { error: "Preencha título e cargo." }

  const supabase = createAdminClient()

  const patch: Record<string, unknown> = {
    titulo,
    cargo,
    vagas: Number.parseInt(String(formData.get("vagas") || "0"), 10) || 0,
    descricao: String(formData.get("descricao") || "").trim() || null,
    tema_prova: String(formData.get("tema_prova") || "").trim() || "Conhecimentos gerais e legislação marítima",
    local: String(formData.get("local") || "").trim() || null,
    escolaridade: String(formData.get("escolaridade") || "").trim() || null,
    taxa: String(formData.get("taxa") || "").trim() || null,
    remuneracao: String(formData.get("remuneracao") || "").trim() || null,
    inscricoes_inicio: String(formData.get("inscricoes_inicio") || "").trim() || null,
    inscricoes_fim: String(formData.get("inscricoes_fim") || "").trim() || null,
    data_prova: String(formData.get("data_prova") || "").trim() || null,
  }

  // Upload de imagem, se enviada
  const imagem = formData.get("imagem") as File | null
  if (imagem && typeof imagem === "object" && imagem.size > 0) {
    const ext = imagem.name.split(".").pop()?.toLowerCase() || "png"
    const caminho = `${id}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from("concursos")
      .upload(caminho, imagem, { contentType: imagem.type, upsert: true })
    if (upErr) return { error: `Falha no upload da imagem: ${upErr.message}` }
    const { data: pub } = supabase.storage.from("concursos").getPublicUrl(caminho)
    patch.image_url = pub.publicUrl
  } else {
    const imageUrl = String(formData.get("image_url") || "").trim()
    if (imageUrl) patch.image_url = imageUrl
  }

  const { error } = await supabase.from("contests").update(patch).eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/admin/concursos")
  revalidatePath("/")
  revalidatePath("/concursos")
  revalidatePath(`/concursos/${id}`)
  return { success: true }
}

export async function notificarAssinantes(id: string) {
  const supabase = createAdminClient()

  const { data: contest } = await supabase.from("contests").select("*").eq("id", id).single()
  if (!contest) return { error: "Concurso não encontrado." }

  const { data: assinantes } = await supabase
    .from("assinantes")
    .select("email, nome")
    .eq("ativo", true)

  const destinatarios = (assinantes ?? []).filter((a) => a.email)
  if (destinatarios.length === 0) return { error: "Não há assinantes cadastrados para notificar." }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return {
      error:
        "Configure a variável RESEND_API_KEY (em resend.com/api-keys) para enviar os e-mails. Nenhum e-mail foi enviado.",
    }
  }

  const { Resend } = await import("resend")
  const resend = new Resend(apiKey)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://marinha.exemplo.com"
  const assunto = `Novo concurso: ${contest.titulo}`

  let enviados = 0
  const erros: string[] = []

  for (const dest of destinatarios) {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
        <div style="background:#0b2545;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
          <h1 style="margin:0;font-size:18px">Marinha do Brasil — Concursos</h1>
        </div>
        <div style="border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 8px 8px">
          <p>Olá, ${dest.nome || "cidadão"}!</p>
          <p>Um novo concurso está disponível:</p>
          <h2 style="color:#0b2545;font-size:20px;margin:16px 0 8px">${contest.titulo}</h2>
          <p style="margin:4px 0"><strong>Cargo:</strong> ${contest.cargo || "Conforme edital"}</p>
          <p style="margin:4px 0"><strong>Vagas:</strong> ${contest.vagas ?? "Conforme edital"}</p>
          ${contest.descricao ? `<p style="margin:12px 0;color:#475569">${contest.descricao}</p>` : ""}
          <a href="${siteUrl}/concursos/${contest.id}"
             style="display:inline-block;margin-top:16px;background:#c9a227;color:#0b2545;
                    padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
            Ver detalhes do concurso
          </a>
          <p style="margin-top:24px;font-size:12px;color:#94a3b8">
            Você recebeu este e-mail porque se cadastrou para receber notícias da Marinha do Brasil.
          </p>
        </div>
      </div>`

    const { error } = await resend.emails.send({
      from: "Marinha do Brasil <onboarding@resend.dev>",
      to: dest.email,
      subject: assunto,
      html,
    })
    if (error) erros.push(dest.email)
    else enviados += 1
  }

  if (enviados === 0) {
    return { error: "Falha ao enviar os e-mails. Verifique a configuração do Resend." }
  }

  return {
    success: true,
    message: `E-mail enviado para ${enviados} assinante(s)${erros.length ? `, ${erros.length} falha(s).` : "."}`,
  }
}

export async function atualizarStatus(id: string, status: ContestStatus) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("contests").update({ status }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/concursos")
  revalidatePath("/")
  revalidatePath("/concursos")
  revalidatePath("/inscricao")
  return { success: true }
}

export async function atualizarStatusPrevisto(
  id: string,
  statusPrevisto: ContestStatus | null,
  data: string | null,
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("contests")
    .update({ status_previsto: statusPrevisto, status_previsto_data: data || null })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/concursos")
  revalidatePath("/concursos")
  return { success: true }
}

export async function apagarContest(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("contests").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/concursos")
  revalidatePath("/")
  return { success: true }
}

// Remove questões duplicadas comparando o enunciado normalizado
function removerRepetidas(questoes: Questao[]): Questao[] {
  const vistos = new Set<string>()
  const unicas: Questao[] = []
  for (const q of questoes) {
    const chave = q.enunciado.trim().toLowerCase().replace(/\s+/g, " ")
    if (!chave || vistos.has(chave)) continue
    vistos.add(chave)
    unicas.push(q)
  }
  return unicas
}

// Gera a prova por IA a partir do tema do concurso
export async function gerarProva(contestId: string) {
  const supabase = createAdminClient()
  const { data: contest } = await supabase.from("contests").select("*").eq("id", contestId).single()
  if (!contest) return { error: "Concurso não encontrado." }

  const c = contest as Contest

  const QTD_QUESTOES = 30
  const DURACAO_MINUTOS = 60

  // Contexto do concurso usado tanto pela IA quanto pelo gerador local:
  // o título e a descrição são a base das questões.
  const contexto = {
    titulo: c.titulo,
    cargo: c.cargo,
    descricao: c.descricao,
    tema: c.tema_prova,
    vagas: c.vagas,
    escolaridade: c.escolaridade,
    local: c.local,
  }

  let questoes: Questao[]
  let origem: "ia" | "banco"
  let motivo: string | undefined

  try {
    const { object } = await generateObject({
      model: "openai/gpt-4.1-mini",
      schema: z.object({
        questoes: z
          .array(
            z.object({
              enunciado: z.string().describe("O enunciado da questão de múltipla escolha"),
              alternativas: z.array(z.string()).length(4).describe("Exatamente 4 alternativas"),
              correta: z.number().int().min(0).max(3).describe("Índice (0-3) da alternativa correta"),
            }),
          )
          .length(QTD_QUESTOES)
          .describe(`Exatamente ${QTD_QUESTOES} questões`),
      }),
      prompt: `Você é um elaborador de provas de concurso público da Marinha do Brasil (Capitania dos Portos de São Paulo).
Elabore uma prova de múltipla escolha com ${QTD_QUESTOES} questões para o concurso abaixo.

TÍTULO DO CONCURSO: "${c.titulo}"
CARGO: "${c.cargo}"
DESCRIÇÃO OFICIAL: ${c.descricao || "(não informada)"}
CONTEÚDO PROGRAMÁTICO: ${c.tema_prova}
${c.escolaridade ? `ESCOLARIDADE EXIGIDA: ${c.escolaridade}` : ""}

REGRAS OBRIGATÓRIAS:
1. O TÍTULO e a DESCRIÇÃO são a base da prova: todas as questões devem tratar de conhecimentos exigidos
   para atuar no cargo e nas atividades descritas acima. Não gere questões genéricas que sirvam para
   qualquer outro concurso.
2. Extraia os assuntos diretamente dos termos que aparecem no título e na descrição e aprofunde-os.
3. As ${QTD_QUESTOES} questões devem ser todas DIFERENTES — não repita enunciados nem crie variações quase idênticas.
4. Cada questão tem exatamente 4 alternativas e apenas uma correta; varie a posição da alternativa correta.
5. Linguagem formal, nível de concurso público, em português do Brasil.`,
    })
    questoes = removerRepetidas(object.questoes)
    // Se a IA devolver menos questões que o esperado, completa com o gerador local.
    if (questoes.length < QTD_QUESTOES) {
      questoes = removerRepetidas([...questoes, ...gerarProvaFallback(contexto, QTD_QUESTOES)]).slice(0, QTD_QUESTOES)
    }
    origem = "ia"
  } catch (e) {
    // Geração por IA indisponível (ex.: AI Gateway sem cartão cadastrado).
    // Gera localmente questões baseadas no título e na descrição do concurso.
    motivo = e instanceof Error ? e.message : String(e)
    console.log("[v0] gerarProva: IA indisponível, usando gerador local:", motivo)
    questoes = removerRepetidas(gerarProvaFallback(contexto, QTD_QUESTOES))
    origem = "banco"
  }

  if (questoes.length === 0) return { error: "Não foi possível gerar questões para este concurso." }

  const titulo = `Prova — ${c.cargo}`
  const { error } = await supabase
    .from("exams")
    .upsert(
      { contest_id: contestId, titulo, questoes, liberada: false, duracao_minutos: DURACAO_MINUTOS },
      { onConflict: "contest_id" },
    )
  if (error) return { error: error.message }

  revalidatePath("/admin/concursos")
  return { success: true, quantidade: questoes.length, origem, motivo }
}

export async function getExam(contestId: string): Promise<Exam | null> {
  const supabase = createAdminClient()
  const { data } = await supabase.from("exams").select("*").eq("contest_id", contestId).single()
  return (data as Exam) ?? null
}

export async function alternarLiberacao(contestId: string, liberada: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("exams").update({ liberada }).eq("contest_id", contestId)
  if (error) return { error: error.message }
  revalidatePath("/admin/concursos")
  return { success: true }
}
