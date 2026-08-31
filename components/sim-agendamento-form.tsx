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
      setMensagem(resultado.error ?? "Agendamento solicitado com sucesso. Aguarde a confirmação do SIM.")
    })
  }
  return <form action={enviar} className="grid gap-5 rounded-xl border border-border bg-card p-6 shadow-sm">
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="grid gap-2"><Label htmlFor="nome_completo">Nome completo</Label><Input id="nome_completo" name="nome_completo" required /></div>
      <div className="grid gap-2"><Label htmlFor="cpf">CPF</Label><Input id="cpf" name="cpf" required /></div>
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
