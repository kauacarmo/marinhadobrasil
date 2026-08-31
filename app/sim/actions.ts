"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function criarAgendamentoSIM(formData: FormData) {
  const campos = ["nome_completo", "cpf", "email", "telefone", "servico", "data_preferida", "horario_preferido"]
  const valores = Object.fromEntries(campos.map((campo) => [campo, String(formData.get(campo) ?? "").trim()]))
  if (Object.values(valores).some((valor) => !valor)) return { error: "Preencha todos os campos obrigatórios." }
  const supabase = createAdminClient()
  const { error } = await supabase.from("sim_agendamentos").insert({ ...valores, nip: String(formData.get("nip") ?? "").trim(), observacoes: String(formData.get("observacoes") ?? "").trim() })
  return error ? { error: "Não foi possível solicitar o agendamento. Tente novamente." } : { success: true }
}
