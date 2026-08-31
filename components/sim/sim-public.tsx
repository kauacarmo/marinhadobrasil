"use client"

import { useState, useTransition } from "react"
import { CalendarDays, ClipboardCheck, Search, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { criarAgendamento, consultarAgendamento } from "@/app/sim/actions"

type Resultado = { protocolo: string; identificacao: string; nome_completo: string; graduacao_posto: string; data_atendimento: string; horario_atendimento: string; status: string; servico: string; local_atendimento: string; observacoes?: string | null }

const statusLabels: Record<string, string> = { pendente: "Aguardando análise", confirmado: "Confirmado", em_atendimento: "Em atendimento", concluido: "Concluído", cancelado: "Cancelado" }

export function SimPublic() {
  const [aba, setAba] = useState<"agendar" | "consultar">("agendar")
  const [resultado, setResultado] = useState<{ protocolo?: string; agendamento?: Resultado; error?: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function submitAgendar(formData: FormData) {
    setResultado(null)
    startTransition(async () => setResultado(await criarAgendamento(formData)))
  }
  function submitConsultar(formData: FormData) {
    setResultado(null)
    startTransition(async () => setResultado(await consultarAgendamento(formData)))
  }

  return <div className="mx-auto max-w-5xl px-4 py-10">
    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Marinha do Brasil</p><h1 className="mt-2 font-serif text-3xl font-bold text-primary md:text-4xl">Sistema de Identificação da Marinha</h1><p className="mt-2 max-w-2xl text-muted-foreground">Agende seu atendimento para emissão ou atualização da identidade funcional militar e acompanhe a situação pelo protocolo.</p></div>
      <img src="/logosite-3.png" alt="Brasão da Marinha do Brasil" className="size-20 object-contain" />
    </div>
    <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm"><div className="flex gap-2 border-b border-border pb-4"><Button type="button" variant={aba === "agendar" ? "default" : "ghost"} onClick={() => { setAba("agendar"); setResultado(null) }}><CalendarDays data-icon="inline-start" />Novo agendamento</Button><Button type="button" variant={aba === "consultar" ? "default" : "ghost"} onClick={() => { setAba("consultar"); setResultado(null) }}><Search data-icon="inline-start" />Consultar situação</Button></div>
        {aba === "agendar" ? <form action={submitAgendar} className="mt-6 flex flex-col gap-5"><div className="grid gap-5 sm:grid-cols-2"><div><Label htmlFor="identificacao">ID do militar *</Label><Input id="identificacao" name="identificacao" placeholder="ID do jogo ou matrícula" required /></div><div><Label htmlFor="nome_completo">Nome completo *</Label><Input id="nome_completo" name="nome_completo" required /></div><div><Label htmlFor="data_nascimento">Data de nascimento *</Label><Input id="data_nascimento" name="data_nascimento" type="date" required /></div><div><Label htmlFor="graduacao_posto">Graduação / Posto exercida *</Label><Input id="graduacao_posto" name="graduacao_posto" placeholder="Ex.: Primeiro-Tenente" required /></div><div><Label htmlFor="data_atendimento">Data do atendimento *</Label><Input id="data_atendimento" name="data_atendimento" type="date" required /></div><div><Label htmlFor="horario_atendimento">Horário *</Label><Input id="horario_atendimento" name="horario_atendimento" type="time" required /></div></div><Button type="submit" disabled={pending}>{pending ? "Enviando..." : "Solicitar agendamento"}</Button></form> : <form action={submitConsultar} className="mt-6 flex flex-col gap-5"><div><Label htmlFor="busca">Protocolo ou ID do militar</Label><Input id="busca" name="busca" placeholder="Ex.: SIM-2026-ABC123" required /></div><Button type="submit" disabled={pending}>{pending ? "Consultando..." : "Consultar situação"}</Button></form>}
        {resultado?.error && <p className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{resultado.error}</p>}
        {resultado?.protocolo && <div className="mt-6 rounded-md border border-accent/40 bg-accent/10 p-5"><p className="text-sm font-semibold text-primary">Agendamento solicitado</p><p className="mt-1 text-sm text-muted-foreground">Guarde este protocolo para acompanhar sua solicitação.</p><p className="mt-3 font-mono text-xl font-bold tracking-wide text-primary">{resultado.protocolo}</p></div>}
      </section>
      <aside className="flex flex-col gap-4"><div className="rounded-lg border border-border bg-primary p-6 text-primary-foreground"><ShieldCheck className="size-8 text-accent" /><h2 className="mt-4 font-serif text-xl font-bold">Atendimento seguro</h2><p className="mt-2 text-sm leading-relaxed text-primary-foreground/75">Tenha seu ID, nome completo, data de nascimento e graduação ou posto em mãos. O protocolo é a chave para consultar o andamento.</p></div>{resultado?.agendamento && <div className="rounded-lg border border-border bg-card p-6"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Situação do agendamento</p><h2 className="mt-2 font-serif text-2xl font-bold text-primary">{statusLabels[resultado.agendamento.status] ?? resultado.agendamento.status}</h2><dl className="mt-5 flex flex-col gap-3 text-sm"><div><dt className="text-muted-foreground">Protocolo</dt><dd className="font-mono font-semibold">{resultado.agendamento.protocolo}</dd></div><div><dt className="text-muted-foreground">Militar</dt><dd>{resultado.agendamento.nome_completo}</dd></div><div><dt className="text-muted-foreground">Atendimento</dt><dd>{resultado.agendamento.data_atendimento} às {resultado.agendamento.horario_atendimento}</dd></div><div><dt className="text-muted-foreground">Local</dt><dd>{resultado.agendamento.local_atendimento}</dd></div>{resultado.agendamento.observacoes && <div><dt className="text-muted-foreground">Observações</dt><dd>{resultado.agendamento.observacoes}</dd></div>}</dl></div>}</aside>
    </div>
  </div>
}
