"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { dispararWebhooks } from "@/lib/webhooks"
import { DOC_AQUAVIARIO_LABEL, type TipoDocAquaviario } from "@/lib/types"

// Conta quantos webhooks ativos existem por aba (cir, carteira_nautica e funcional_militar).
export async function contarWebhooksAquaviarios(): Promise<{
  cir: number
  carteira_nautica: number
  funcional_militar: number
}> {
  const supabase = createAdminClient()
  const [cir, carteira, funcional] = await Promise.all([
    supabase.from("webhooks").select("id", { count: "exact", head: true }).eq("aba", "cir").eq("ativo", true),
    supabase
      .from("webhooks")
      .select("id", { count: "exact", head: true })
      .eq("aba", "carteira_nautica")
      .eq("ativo", true),
    supabase
      .from("webhooks")
      .select("id", { count: "exact", head: true })
      .eq("aba", "funcional_militar")
      .eq("ativo", true),
  ])
  return {
    cir: cir.count ?? 0,
    carteira_nautica: carteira.count ?? 0,
    funcional_militar: funcional.count ?? 0,
  }
}

type CampoEntrada = { label?: string; valor?: string }

/**
 * Normaliza a menção do titular para o formato do Discord.
 * Aceita o ID numérico do usuário, a menção já formatada ou um @apelido.
 */
function normalizarMencaoPessoa(bruto: string): string {
  const v = bruto.trim()
  if (!v) return ""
  if (/^<@!?\d+>$/.test(v)) return v
  if (/^\d{5,25}$/.test(v)) return `<@${v}>`
  return v
}

export async function emitirDocumentoAquaviario(formData: FormData) {
  const tipo = String(formData.get("tipo") || "") as TipoDocAquaviario
  if (tipo !== "cir" && tipo !== "carteira_nautica" && tipo !== "funcional_militar") {
    return { error: "Tipo de documento inválido." }
  }

  const titular = String(formData.get("titular") || "").trim()
  const foto_url = String(formData.get("foto_url") || "").trim() || null
  const rodape = String(formData.get("rodape") || "").trim() || null

  // Card visual do documento (PNG) gerado no navegador e hospedado no Blob.
  const cardBruto = String(formData.get("card_url") || "").trim()
  const card_url = /^https?:\/\//i.test(cardBruto) ? cardBruto : null

  // Menção geral (ex.: @everyone) + menção direta ao titular do documento.
  const mencaoGeral = String(formData.get("mencao") || "").trim()
  const mencaoPessoa = normalizarMencaoPessoa(String(formData.get("mencao_pessoa") || ""))
  const mencao = [mencaoGeral, mencaoPessoa].filter(Boolean).join(" ") || null

  let campos: { label: string; valor: string }[] = []
  try {
    const bruto = JSON.parse(String(formData.get("campos") || "[]")) as CampoEntrada[]
    if (Array.isArray(bruto)) {
      campos = bruto
        .map((c) => ({ label: String(c?.label || "").trim(), valor: String(c?.valor || "").trim() }))
        .filter((c) => c.label && c.valor)
    }
  } catch {
    campos = []
  }

  if (!titular) return { error: "Informe o nome do titular do documento." }
  if (campos.length === 0) return { error: "Preencha ao menos um campo do documento." }

  const supabase = createAdminClient()
  const { count } = await supabase
    .from("webhooks")
    .select("id", { count: "exact", head: true })
    .eq("aba", tipo)
    .eq("ativo", true)

  if ((count ?? 0) === 0) {
    return {
      error:
        "Nenhum webhook ativo para este documento está configurado. Adicione um em Configurações › Webhooks para emitir.",
    }
  }

  await dispararWebhooks(tipo, "emitida", {
    documento: tipo,
    titulo: DOC_AQUAVIARIO_LABEL[tipo],
    titular,
    campos,
    foto_url,
    card_url,
    rodape,
    mencao,
    data: new Date().toISOString().slice(0, 10),
  })

  return { success: true }
}
