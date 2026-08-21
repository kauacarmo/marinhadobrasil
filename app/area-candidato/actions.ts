"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  hashSenha,
  verificarSenha,
  criarSessaoCandidato,
  encerrarSessaoCandidato,
  getCandidatoAtual,
} from "@/lib/candidato-auth"

export async function criarConta(_prev: unknown, formData: FormData) {
  const idJogo = String(formData.get("id_jogo") || "").trim()
  const nome = String(formData.get("nome") || "").trim()
  const senha = String(formData.get("senha") || "")
  const confirmar = String(formData.get("confirmar") || "")

  if (!idJogo) return { error: "Informe o ID do jogo." }
  if (!nome) return { error: "Informe o seu nome." }
  if (senha.length < 4) return { error: "A senha deve ter ao menos 4 caracteres." }
  if (senha !== confirmar) return { error: "As senhas não coincidem." }

  const supabase = createAdminClient()

  const { data: existente } = await supabase
    .from("candidatos_conta")
    .select("id")
    .eq("id_jogo", idJogo)
    .maybeSingle()
  if (existente) return { error: "Já existe uma conta com este ID do jogo. Faça login." }

  const { data, error } = await supabase
    .from("candidatos_conta")
    .insert({ id_jogo: idJogo, nome, senha_hash: hashSenha(senha) })
    .select("id")
    .single()
  if (error || !data) return { error: "Não foi possível criar a conta. Tente novamente." }

  await criarSessaoCandidato(data.id)
  revalidatePath("/area-candidato")
  return { success: true }
}

export async function entrar(_prev: unknown, formData: FormData) {
  const idJogo = String(formData.get("id_jogo") || "").trim()
  const senha = String(formData.get("senha") || "")

  if (!idJogo || !senha) return { error: "Informe o ID do jogo e a senha." }

  const supabase = createAdminClient()
  const { data: conta } = await supabase
    .from("candidatos_conta")
    .select("id, senha_hash")
    .eq("id_jogo", idJogo)
    .maybeSingle()

  if (!conta || !verificarSenha(senha, conta.senha_hash)) {
    return { error: "ID do jogo ou senha inválidos." }
  }

  await criarSessaoCandidato(conta.id)
  revalidatePath("/area-candidato")
  return { success: true }
}

export async function sair() {
  await encerrarSessaoCandidato()
  revalidatePath("/area-candidato")
}

export async function inscreverEmCurso(_prev: unknown, formData: FormData) {
  const candidato = await getCandidatoAtual()
  if (!candidato) return { error: "Sua sessão expirou. Entre novamente para se inscrever." }

  const cursoId = String(formData.get("curso_id") || "").trim()
  const nomePersonagem = String(formData.get("nome_personagem") || "").trim()
  const observacoes = String(formData.get("observacoes") || "").trim() || null
  if (!cursoId) return { error: "Curso inválido." }
  if (!nomePersonagem) return { error: "Informe o nome do personagem." }

  const supabase = createAdminClient()

  // Valida o curso: precisa estar publicado
  const { data: curso } = await supabase
    .from("cursos")
    .select("id, vagas, inscricoes_fim, publicado")
    .eq("id", cursoId)
    .single()
  if (!curso || !curso.publicado) return { error: "Curso indisponível para inscrição." }

  // Prazo de inscrição
  if (curso.inscricoes_fim) {
    const hoje = new Date().toISOString().slice(0, 10)
    if (curso.inscricoes_fim < hoje) return { error: "As inscrições para este curso estão encerradas." }
  }

  // Já inscrito?
  const { data: existente } = await supabase
    .from("curso_inscricoes")
    .select("id")
    .eq("curso_id", cursoId)
    .eq("candidato_conta_id", candidato.id)
    .maybeSingle()
  if (existente) return { error: "Você já está inscrito neste curso." }

  // Controle de vagas
  if (curso.vagas > 0) {
    const { count } = await supabase
      .from("curso_inscricoes")
      .select("id", { count: "exact", head: true })
      .eq("curso_id", cursoId)
    if ((count ?? 0) >= curso.vagas) return { error: "As vagas para este curso já foram preenchidas." }
  }

  const { error } = await supabase.from("curso_inscricoes").insert({
    curso_id: cursoId,
    candidato_conta_id: candidato.id,
    id_jogo: candidato.id_jogo,
    nome: candidato.nome,
    nome_personagem: nomePersonagem,
    observacoes,
  })
  if (error) {
    if (error.code === "23505") return { error: "Você já está inscrito neste curso." }
    return { error: "Não foi possível concluir a inscrição. Tente novamente." }
  }

  revalidatePath("/area-candidato")
  return { success: true }
}
