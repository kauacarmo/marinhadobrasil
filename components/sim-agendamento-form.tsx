"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { criarAgendamentoSIM } from "@/app/sim/actions"

export function SimAgendamentoForm() {
  const [pending, startTransition] = useTransition()
  const [mensagem, setMensagem] = useState("")
  function enviar(formData: FormData) {
    setMensagem("")
    startTransition(async () => {
      const resultado = await criarAgendamentoSIM(formData)
      setMensagem(resultado.error ?? `Agendamento solicitado com sucesso. Seu código de acompanhamento é ${resultado.protocolo}. Guarde-o para consultar a situação.`)
    })
  }
  return <form action={enviar} className="grid gap-5 rounded-xl border border-border bg-card p-6 shadow-sm">
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="grid gap-2"><Label htmlFor="nome_completo">Nome completo</Label><Input id="nome_completo" name="nome_completo" required /></div>
      <div className="grid gap-2"><Label htmlFor="cpf">Identificação</Label><Input id="identificacao" name="identificacao" required placeholder="CPF, NIP ou identidade" /></div>
      <div className="grid gap-2"><Label htmlFor="data_nascimento">Data de nascimento</Label><Input id="data_nascimento" name="data_nascimento" type="date" required /></div>
      <div className="grid gap-2"><Label htmlFor="graduacao_posto">Graduação / posto</Label><Input id="graduacao_posto" name="graduacao_posto" required /></div>
      <div className="grid gap-2"><Label htmlFor="nip">NIP (opcional)</Label><Input id="nip" name="nip" /></div>
      <div className="grid gap-2"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" required /></div>
      <div className="grid gap-2"><Label htmlFor="telefone">Telefone</Label><Input id="telefone" name="telefone" required /></div>
      <div className="grid gap-2"><Label htmlFor="servico">Serviço</Label><select id="servico" name="servico" required className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Selecione</option><option>Emissão de identidade</option><option>Renovação de identidade</option><option>Atualização cadastral</option><option>Outro atendimento</option></select></div>
      <div className="grid gap-2"><Label htmlFor="data_preferida">Data preferida</Label><Input id="data_preferida" name="data_preferida" type="date" required /></div>
      <div className="grid gap-2"><Label htmlFor="horario_preferido">Horário preferido</Label><Input id="horario_preferido" name="horario_preferido" type="time" required /></div>
    </div>
    <div className="grid gap-2"><Label htmlFor="observacoes">Observações</Label><Textarea id="observacoes" name="observacoes" rows={4} /></div>
    <Button disabled={pending} type="submit">{pending ? "Enviando..." : "Solicitar agendamento"}</Button>
    {mensagem && <p role="status" className="text-sm text-muted-foreground">{mensagem}</p>}
  </form>
}
