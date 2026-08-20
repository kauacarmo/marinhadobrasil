"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { dispararWebhooks } from "@/lib/webhooks"

function gerarCodigoProva() {
  // Código de 8 caracteres alfanuméricos legíveis
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `${code.slice(0, 4)}-${code.slice(4)}`
}

// Gera o próximo número de inscrição no formato ANO-NNNNN, sequencial no ano
async function gerarNumeroInscricao(supabase: ReturnType<typeof createAdminClient>) {
  const ano = new Date().getFullYear()
  const { count } = await supabase
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .like("numero_inscricao", `${ano}-%`)

  const proximo = (count ?? 0) + 1
  return `${ano}-${String(proximo).padStart(5, "0")}`
}

export async function realizarInscricao(formData: FormData) {
  const contestId = String(formData.get("contest_id") || "")
  const idJogo = String(formData.get("id_jogo") || "").trim()
  const nomePersonagem = String(formData.get("nome_personagem") || "").trim()
  const idadeRaw = String(formData.get("idade") || "").trim()
  const dataNascimento = String(formData.get("data_nascimento") || "").trim()

  if (!contestId) return { error: "Selecione um concurso." }
  if (!idJogo) return { error: "Informe o ID do jogo." }
  if (!nomePersonagem) return { error: "Informe o nome do personagem." }

  // O nome do candidato passa a ser o nome do personagem
  const nome = nomePersonagem

  const idade = Number.parseInt(idadeRaw, 10)
  if (!Number.isInteger(idade) || idade <= 0 || idade >= 130) {
    return { error: "Informe uma idade válida." }
  }
  if (!dataNascimento) return { error: "Informe a data de nascimento." }

  const supabase = createAdminClient()

  // Verifica se o concurso existe e está com inscrições abertas
  const { data: contest } = await supabase
    .from("contests")
    .select("id, titulo, status")
    .eq("id", contestId)
    .single()

  if (!contest) return { error: "Concurso não encontrado." }
  if (contest.status !== "inscricoes_abertas") {
    return { error: "As inscrições para este concurso não estão abertas." }
  }

  const codigoProva = gerarCodigoProva()

  // Gera o número de inscrição automaticamente, com até 5 tentativas
  // para evitar colisões de sequência em inscrições simultâneas.
  let numeroInscricao = ""
  let inseriu = false
  let ultimoErro: { code?: string; message: string } | null = null

  for (let tentativa = 0; tentativa < 5; tentativa++) {
    numeroInscricao = await gerarNumeroInscricao(supabase)
    const { error } = await supabase.from("registrations").insert({
      contest_id: contestId,
      numero_inscricao: numeroInscricao,
      id_jogo: idJogo,
      nome_personagem: nomePersonagem,
      nome,
      idade,
      data_nascimento: dataNascimento,
      codigo_prova: codigoProva,
    })

    if (!error) {
      inseriu = true
      break
    }

    ultimoErro = error
    // 23505 = violação de unicidade; tenta novamente com o próximo número
    if (error.code !== "23505") break
  }

  if (!inseriu) {
    return { error: ultimoErro?.message || "Não foi possível concluir a inscrição." }
  }

  await dispararWebhooks("candidatos", "inscrito", {
    concurso_id: contestId,
    concurso: contest.titulo,
    numero_inscricao: numeroInscricao,
    id_jogo: idJogo,
    nome_personagem: nomePersonagem,
    nome,
    idade,
  })

  return {
    success: true,
    codigo: codigoProva,
    numeroInscricao,
    nome,
    concurso: contest.titulo,
  }
}
