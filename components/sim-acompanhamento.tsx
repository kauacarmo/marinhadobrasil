"use client"

import { useState } from "react"
import { consultarAgendamentoSIM } from "@/app/sim/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SimAcompanhamento() {
  const [protocolo, setProtocolo] = useState("")
  const [resultado, setResultado] = useState<any>(null)
  async function consultar() { setResultado(await consultarAgendamentoSIM(protocolo)) }
  return <div className="grid gap-4 rounded-xl border border-border bg-card p-6">
    <div><h2 className="font-serif text-xl font-bold text-foreground">Acompanhe seu atendimento</h2><p className="mt-1 text-sm text-muted-foreground">Informe o código recebido após solicitar o agendamento.</p></div>
    <div className="flex flex-col gap-3 sm:flex-row"><Input value={protocolo} onChange={(event) => setProtocolo(event.target.value)} placeholder="Ex.: SIM-AB12CD34" aria-label="Código de acompanhamento" /><Button type="button" onClick={consultar} disabled={!protocolo.trim()}>Consultar situação</Button></div>
    {resultado?.error && <p role="alert" className="text-sm text-destructive">{resultado.error}</p>}
    {resultado?.data && <div className="rounded-lg bg-muted p-4 text-sm"><p><strong>Protocolo:</strong> {resultado.data.protocolo}</p><p><strong>Status:</strong> {resultado.data.status}</p><p><strong>Data:</strong> {resultado.data.data_atendimento} às {resultado.data.horario_atendimento}</p></div>}
  </div>
}
