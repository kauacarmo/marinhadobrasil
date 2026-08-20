"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { dispararWebhooks } from "@/lib/webhooks"

function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function cadastrarAssinante(_prev: unknown, formData: FormData) {
  const nome = String(formData.get("nome") || "").trim()
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const cidade = String(formData.get("cidade") || "").trim()

  if (!nome || !email) {
    return { ok: false, message: "Preencha nome e e-mail." }
  }
  if (!emailValido(email)) {
    return { ok: false, message: "Informe um e-mail válido." }
  }

  const supabase = createAdminClient()

  const { data: existente } = await supabase
    .from("assinantes")
    .select("id, ativo")
    .eq("email", email)
    .maybeSingle()

  if (existente) {
    if (!existente.ativo) {
      await supabase.from("assinantes").update({ ativo: true, nome, cidade: cidade || null }).eq("id", existente.id)
      return { ok: true, message: "Sua inscrição foi reativada. Você voltará a receber nossas notícias." }
    }
    return { ok: false, message: "Este e-mail já está cadastrado para receber notícias." }
  }

  const { error } = await supabase.from("assinantes").insert({
    nome,
    email,
    cidade: cidade || null,
  })

  if (error) {
    return { ok: false, message: "Não foi possível concluir o cadastro. Tente novamente." }
  }

  await dispararWebhooks("assinantes", "cadastrado", { nome, email, cidade: cidade || null })

  return { ok: true, message: "Cadastro realizado! Você receberá as notícias da Marinha por e-mail." }
}
