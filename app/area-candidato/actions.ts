"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  hashSenha,
  verificarSenha,
  criarSessaoCandidato,
  encerrarSessaoCandidato,
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
