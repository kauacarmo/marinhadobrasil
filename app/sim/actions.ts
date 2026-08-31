"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

const STATUS = ["pendente", "confirmado", "em_atendimento", "concluido", "cancelado"] as const
export type SimStatus = (typeof STATUS)[number]

function protocolo() {
  return `SIM-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export async function criarAgendamento(formData: FormData) {
  const identificacao = String(formData.get("identificacao") || "").trim()
  const nome_completo = String(formData.get("nome_completo") || "").trim()
  const data_nascimento = String(formData.get("data_nascimento") || "").trim()
  const graduacao_posto = String(formData.get("graduacao_posto") || "").trim()
  const data_atendimento = String(formData.get("data_atendimento") || "").trim()
  const horario_atendimento = String(formData.get("horario_atendimento") || "").trim()

  if (!identificacao || !nome_completo || !data_nascimento || !graduacao_posto || !data_atendimento || !horario_atendimento) {
    return { error: "Preencha todos os campos obrigatórios." }
  }

  const supabase = createAdminClient()
  const codigo = protocolo()
  const { error } = await supabase.from("sim_agendamentos").insert({
    protocolo: codigo, identificacao, nome_completo, data_nascimento, graduacao_posto,
    data_atendimento, horario_atendimento, status: "pendente",
  })
  if (error) return { error: "Não foi possível criar o agendamento. Tente novamente." }
  return { success: true, protocolo: codigo }
}

export async function consultarAgendamento(formData: FormData) {
  const busca = String(formData.get("busca") || "").trim()
  if (!busca) return { error: "Informe o protocolo ou ID." }
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("sim_agendamentos")
    .select("protocolo, identificacao, nome_completo, data_nascimento, graduacao_posto, data_atendimento, horario_atendimento, servico, local_atendimento, status, observacoes")
    .or(`protocolo.eq.${busca},identificacao.eq.${busca}`)
    .maybeSingle()
  if (error || !data) return { error: "Nenhum agendamento encontrado." }
  return { success: true, agendamento: data }
}

export async function listarAgendamentos() {
  const supabase = createAdminClient()
  const { data } = await supabase.from("sim_agendamentos").select("*").order("data_atendimento", { ascending: true }).order("horario_atendimento", { ascending: true })
  return data ?? []
}

export async function atualizarStatusSim(id: string, status: SimStatus, observacoes: string) {
  if (!STATUS.includes(status)) return { error: "Status inválido." }
  const supabase = createAdminClient()
  const { error } = await supabase.from("sim_agendamentos").update({ status, observacoes: observacoes.trim() || null, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) return { error: "Não foi possível atualizar o agendamento." }
  revalidatePath("/admin/sim")
  return { success: true }
}

export async function excluirAgendamentoSim(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("sim_agendamentos").delete().eq("id", id)
  if (error) return { error: "Não foi possível excluir o agendamento." }
  revalidatePath("/admin/sim")
  return { success: true }
}
