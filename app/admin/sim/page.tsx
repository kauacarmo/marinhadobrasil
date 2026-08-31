import type { Metadata } from "next"
import { listarAgendamentosSIM } from "./actions"
import { SimAgendamentosAdmin } from "@/components/admin/sim-agendamentos-admin"

export const metadata: Metadata = { title: "Agendamentos SIM | Administração" }

export default async function AdminSimPage() {
  const agendamentos = await listarAgendamentosSIM()
  return <div className="mx-auto max-w-6xl px-6 py-10"><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-widest text-accent">Serviço de Identificação da Marinha</p><h1 className="font-serif text-3xl font-bold text-foreground">Agendamentos SIM</h1><p className="mt-2 text-muted-foreground">Consulte e atualize as solicitações de atendimento.</p></div><SimAgendamentosAdmin agendamentos={agendamentos} /></div>
}
