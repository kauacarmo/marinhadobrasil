"use client"

import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { atualizarStatusSim, excluirAgendamentoSim, type SimStatus } from "@/app/sim/actions"

const status: { value: SimStatus; label: string }[] = [{ value: "pendente", label: "Pendente" }, { value: "confirmado", label: "Confirmado" }, { value: "em_atendimento", label: "Em atendimento" }, { value: "concluido", label: "Concluído" }, { value: "cancelado", label: "Cancelado" }]

type Registro = { id: string; protocolo: string; identificacao: string; nome_completo: string; data_nascimento: string; graduacao_posto: string; data_atendimento: string; horario_atendimento: string; status: SimStatus; observacoes: string | null }

export function SimManager({ registros }: { registros: Registro[] }) {
  const [filtro, setFiltro] = useState("")
  const [pending, startTransition] = useTransition()
  const [mensagem, setMensagem] = useState("")
  const filtrados = registros.filter((r) => `${r.nome_completo} ${r.protocolo} ${r.identificacao}`.toLowerCase().includes(filtro.toLowerCase()))

  function atualizar(id: string, value: string, obs: string) {
    startTransition(async () => { const res = await atualizarStatusSim(id, value as SimStatus, obs); setMensagem(res.error ?? "Status atualizado."); setTimeout(() => setMensagem(""), 2500) })
  }
  return <div className="p-6 lg:p-10"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-wider text-accent">SIM</p><h1 className="font-serif text-3xl font-bold text-primary">Agendamentos</h1><p className="mt-1 text-muted-foreground">Gerencie a agenda e atualize a situação dos atendimentos.</p></div><input className="h-10 rounded-md border border-border bg-background px-3 text-sm" placeholder="Buscar por nome, ID ou protocolo" value={filtro} onChange={(e) => setFiltro(e.target.value)} /></div>{mensagem && <p className="mt-5 rounded-md border border-accent/30 bg-accent/10 p-3 text-sm">{mensagem}</p>}<div className="mt-8 flex flex-col gap-4">{filtrados.map((r) => <article key={r.id} className="rounded-lg border border-border bg-card p-5"><div className="flex flex-col justify-between gap-3 md:flex-row"><div><p className="font-mono text-sm font-semibold text-primary">{r.protocolo}</p><h2 className="mt-1 font-serif text-xl font-bold">{r.nome_completo}</h2><p className="text-sm text-muted-foreground">ID: {r.identificacao} · {r.graduacao_posto}</p></div><Badge variant={r.status === "cancelado" ? "destructive" : r.status === "concluido" ? "default" : "secondary"}>{status.find((s) => s.value === r.status)?.label}</Badge></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><p><span className="text-muted-foreground">Nascimento</span><br />{r.data_nascimento}</p><p><span className="text-muted-foreground">Atendimento</span><br />{r.data_atendimento} às {r.horario_atendimento}</p><p><span className="text-muted-foreground">Observações</span><br />{r.observacoes || "—"}</p></div><div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 md:flex-row md:items-end"><label className="flex flex-1 flex-col gap-1 text-xs font-medium">Nova situação<select className="h-9 rounded-md border border-border bg-background px-2 text-sm" defaultValue={r.status} onChange={(e) => atualizar(r.id, e.target.value, "")} disabled={pending}>{status.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label><label className="flex flex-[2] flex-col gap-1 text-xs font-medium">Observação<textarea className="min-h-9 rounded-md border border-border bg-background px-2 py-2 text-sm" defaultValue={r.observacoes ?? ""} onBlur={(e) => atualizar(r.id, r.status, e.target.value)} placeholder="Mensagem para o militar" /></label><Button variant="outline" size="sm" onClick={() => { if (window.confirm("Excluir este agendamento?")) startTransition(async () => { await excluirAgendamentoSim(r.id); window.location.reload() }) }}>Excluir</Button></div></article>)}{filtrados.length === 0 && <p className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">Nenhum agendamento encontrado.</p>}</div></div>
}
