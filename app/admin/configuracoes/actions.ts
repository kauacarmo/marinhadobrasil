"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { montarCorpoWebhook } from "@/lib/webhooks"
import type { AbaWebhook, Webhook } from "@/lib/types"

export async function listWebhooks(): Promise<Webhook[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("webhooks")
    .select("*")
    .order("created_at", { ascending: false })
  if (error || !data) return []
  return data as Webhook[]
}

export async function criarWebhook(formData: FormData) {
  const aba = String(formData.get("aba") || "").trim() as AbaWebhook
  const url = String(formData.get("url") || "").trim()
  const nome = String(formData.get("nome") || "").trim()

  if (!aba || !url) return { error: "Selecione a aba e informe a URL." }
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { error: "A URL precisa começar com http:// ou https://." }
    }
  } catch {
    return { error: "URL inválida." }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("webhooks").insert({
    aba,
    url,
    nome: nome || null,
  })
  if (error) return { error: error.message }

  revalidatePath("/admin/configuracoes")
  return { success: true }
}

export async function alternarWebhook(id: string, ativo: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("webhooks").update({ ativo }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/configuracoes")
  return { success: true }
}

export async function apagarWebhook(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("webhooks").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin/configuracoes")
  return { success: true }
}

export async function obterConfiguracoesSite() {
  const supabase = createAdminClient()
  const { data } = await supabase.from("site_settings").select("orgao,email,telefone,endereco,banner_concursos,notificacoes_email").eq("id", 1).maybeSingle()
  return data ?? { orgao: "Diretoria de Ensino da Marinha", email: "concursos@marinha.mil.br", telefone: "(21) 2104-5000", endereco: "Rua da Ponte, s/nº - Ilha das Cobras - Rio de Janeiro/RJ", banner_concursos: true, notificacoes_email: true }
}

export async function salvarConfiguracoesSite(formData: FormData) {
  const supabase = createAdminClient()
  const valores = {
    orgao: String(formData.get("orgao") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    telefone: String(formData.get("telefone") ?? "").trim(),
    endereco: String(formData.get("endereco") ?? "").trim(),
    banner_concursos: formData.get("banner_concursos") === "on",
    notificacoes_email: formData.get("notificacoes_email") === "on",
    updated_at: new Date().toISOString(),
  }
  if (!valores.orgao || !valores.email || !valores.telefone || !valores.endereco) return { error: "Preencha todos os dados obrigatórios." }
  const { error } = await supabase.from("site_settings").update(valores).eq("id", 1)
  if (error) return { error: "Não foi possível salvar as configurações." }
  revalidatePath("/")
  revalidatePath("/admin/configuracoes")
  return { success: true }
}

export async function testarWebhook(id: string) {
  const supabase = createAdminClient()
  const { data: webhook } = await supabase.from("webhooks").select("*").eq("id", id).single()
  if (!webhook) return { error: "Webhook não encontrado." }

  const url = String(webhook.url ?? "").trim()
  if (!/^https?:\/\//i.test(url)) {
    return { error: "A URL do webhook é inválida. Ela deve começar com http:// ou https://." }
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Aba": webhook.aba,
        "X-Webhook-Evento": "teste",
      },
      body: montarCorpoWebhook(url, webhook.aba, "teste", null),
    })
    if (!res.ok) {
      const detalhe = (await res.text().catch(() => "")).slice(0, 200)
      return {
        error: `O endpoint respondeu com status ${res.status}.${detalhe ? ` Detalhe: ${detalhe}` : ""}`,
      }
    }
    return { success: true, message: "Teste enviado com sucesso." }
  } catch (err) {
    return { error: `Não foi possível conectar ao endpoint: ${String(err)}` }
  }
}
