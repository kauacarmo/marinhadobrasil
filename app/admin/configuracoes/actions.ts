"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
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

export async function testarWebhook(id: string) {
  const supabase = createAdminClient()
  const { data: webhook } = await supabase.from("webhooks").select("*").eq("id", id).single()
  if (!webhook) return { error: "Webhook não encontrado." }

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Aba": webhook.aba,
        "X-Webhook-Evento": "teste",
      },
      body: JSON.stringify({
        aba: webhook.aba,
        evento: "teste",
        dados: { mensagem: "Disparo de teste do painel administrativo." },
        enviado_em: new Date().toISOString(),
      }),
    })
    if (!res.ok) return { error: `O endpoint respondeu com status ${res.status}.` }
    return { success: true, message: "Teste enviado com sucesso." }
  } catch (err) {
    return { error: `Não foi possível conectar ao endpoint: ${String(err)}` }
  }
}
