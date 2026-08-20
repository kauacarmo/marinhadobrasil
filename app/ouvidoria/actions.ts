"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { dispararWebhooks } from "@/lib/webhooks"

const TIPOS = ["elogio", "duvida", "reclamacao", "sugestao", "denuncia"]

function gerarProtocolo() {
  const ano = new Date().getFullYear()
  const seq = Math.floor(100000 + Math.random() * 900000)
  return `OUV-${ano}-${seq}`
}

export async function registrarManifestacao(_prev: unknown, formData: FormData) {
  const tipo = String(formData.get("tipo") || "").trim()
  const nome = String(formData.get("nome") || "").trim()
  const email = String(formData.get("email") || "").trim()
  const mensagem = String(formData.get("mensagem") || "").trim()

  if (!TIPOS.includes(tipo)) return { error: "Selecione o tipo de manifestação." }
  if (mensagem.length < 10) return { error: "Descreva sua manifestação com ao menos 10 caracteres." }

  const protocolo = gerarProtocolo()
  const supabase = createAdminClient()
  const { error } = await supabase.from("ouvidoria").insert({
    protocolo,
    tipo,
    nome: nome || null,
    email: email || null,
    mensagem,
  })

  if (error) return { error: "Não foi possível registrar sua manifestação. Tente novamente." }

  await dispararWebhooks("ouvidoria", tipo, { protocolo, tipo, nome: nome || null, email: email || null })

  return { success: true, protocolo }
}
