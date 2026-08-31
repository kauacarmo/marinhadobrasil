"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { randomBytes } from "node:crypto"

export async function criarAgendamentoSIM(formData: FormData) {
  const valores = {
    nome_completo: String(formData.get("nome_completo") ?? "").trim(),
    identificacao: String(formData.get("identificacao") ?? "").trim(),
    data_nascimento: String(formData.get("data_nascimento") ?? "").trim(),
    graduacao_posto: String(formData.get("graduacao_posto") ?? "").trim(),
    data_atendimento: String(formData.get("data_preferida") ?? "").trim(),
    horario_atendimento: String(formData.get("horario_preferido") ?? "").trim(),
    servico: String(formData.get("servico") ?? "").trim(),
    observacoes: String(formData.get("observacoes") ?? "").trim(),
  }
  if (Object.values(valores).slice(0, 7).some((valor) => !valor)) return { error: "Preencha todos os campos obrigatórios." }
  const protocolo = `SIM-${randomBytes(4).toString("hex").toUpperCase()}`
  const supabase = createAdminClient()
  const { error } = await supabase.from("sim_agendamentos").insert({ ...valores, protocolo, local_atendimento: "Serviço de Identificação da Marinha" })
  return error ? { error: "Não foi possível solicitar o agendamento. Tente novamente." } : { success: true, protocolo }
}

export async function consultarAgendamentoSIM(protocolo: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("sim_agendamentos").select("protocolo,nome_completo,data_atendimento,horario_atendimento,servico,status,created_at").eq("protocolo", protocolo.trim().toUpperCase()).maybeSingle()
  return error || !data ? { error: "Protocolo não encontrado." } : { data }
}
