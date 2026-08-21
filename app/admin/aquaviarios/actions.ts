"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { dispararWebhooks } from "@/lib/webhooks"
import { DOC_AQUAVIARIO_LABEL, type TipoDocAquaviario } from "@/lib/types"

// Conta quantos webhooks ativos existem por aba (cir e carteira_militar).
export async function contarWebhooksAquaviarios(): Promise<{ cir: number; carteira_militar: number }> {
  const supabase = createAdminClient()
  const [cir, carteira] = await Promise.all([
    supabase.from("webhooks").select("id", { count: "exact", head: true }).eq("aba", "cir").eq("ativo", true),
    supabase
      .from("webhooks")
      .select("id", { count: "exact", head: true })
      .eq("aba", "carteira_militar")
      .eq("ativo", true),
  ])
  return { cir: cir.count ?? 0, carteira_militar: carteira.count ?? 0 }
}

type CampoEntrada = { label?: string; valor?: string }

export async function emitirDocumentoAquaviario(formData: FormData) {
  const tipo = String(formData.get("tipo") || "") as TipoDocAquaviario
  if (tipo !== "cir" && tipo !== "carteira_militar") {
    return { error: "Tipo de documento inválido." }
  }

  const titular = String(formData.get("titular") || "").trim()
  const foto_url = String(formData.get("foto_url") || "").trim() || null
  const rodape = String(formData.get("rodape") || "").trim() || null
  const mencao = String(formData.get("mencao") || "").trim() || null

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
    rodape,
    mencao,
    data: new Date().toISOString().slice(0, 10),
  })

  return { success: true }
}
