"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export async function listarAgendamentosSIM() {
  const { data } = await createAdminClient().from("sim_agendamentos").select("id,protocolo,nome_completo,identificacao,data_nascimento,graduacao_posto,data_atendimento,horario_atendimento,servico,local_atendimento,observacoes,status,created_at").order("data_preferida", { ascending: true })
  return data ?? []
}

export async function atualizarStatusSIM(id: string, status: string) {
  if (!["pendente", "confirmado", "concluido", "cancelado"].includes(status)) return { error: "Status inválido." }
  const { error } = await createAdminClient().from("sim_agendamentos").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) return { error: "Não foi possível atualizar o agendamento." }
  revalidatePath("/admin/sim")
  return { success: true }
}
