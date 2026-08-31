"use client"

import { useTransition } from "react"
import { atualizarStatusSIM } from "@/app/admin/sim/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Agendamento = { id: string; nome_completo: string; cpf: string; nip: string | null; email: string; telefone: string; servico: string; data_preferida: string; horario_preferido: string; observacoes: string | null; status: string }

export function SimAgendamentosAdmin({ agendamentos }: { agendamentos: Agendamento[] }) {
  const [pending, startTransition] = useTransition()
  return <div className="grid gap-4">{agendamentos.length === 0 ? <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">Nenhum agendamento recebido.</div> : agendamentos.map((agendamento) => <article key={agendamento.id} className="rounded-xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-semibold text-foreground">{agendamento.nome_completo}</h2><p className="text-sm text-muted-foreground">{agendamento.servico} · {agendamento.data_preferida} às {agendamento.horario_preferido}</p></div><Badge>{agendamento.status}</Badge></div><div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3"><span>CPF: {agendamento.cpf}</span><span>E-mail: {agendamento.email}</span><span>Telefone: {agendamento.telefone}</span></div>{agendamento.observacoes && <p className="mt-3 text-sm text-muted-foreground">{agendamento.observacoes}</p>}<div className="mt-4 flex flex-wrap gap-2">{["confirmado", "concluido", "cancelado"].map((status) => <Button key={status} size="sm" variant={agendamento.status === status ? "default" : "outline"} disabled={pending} onClick={() => startTransition(() => atualizarStatusSIM(agendamento.id, status))}>{status[0].toUpperCase() + status.slice(1)}</Button>)}</div></article>)}</div>
}
