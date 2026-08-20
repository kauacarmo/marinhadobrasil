"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { enviarManifestacao } from "@/app/ouvidoria/actions"

const TIPOS = [
  { valor: "elogio", label: "Elogio" },
  { valor: "duvida", label: "Dúvida" },
  { valor: "reclamacao", label: "Reclamação" },
  { valor: "sugestao", label: "Sugestão" },
  { valor: "denuncia", label: "Denúncia" },
]

export function OuvidoriaForm() {
  const [enviando, setEnviando] = useState(false)
  const [protocolo, setProtocolo] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    setEnviando(true)
    setErro(null)
    const res = await enviarManifestacao(formData)
    setEnviando(false)
    if (res?.error) setErro(res.error)
    else if (res?.protocolo) setProtocolo(res.protocolo)
  }

  if (protocolo) {
    return (
      <div className="rounded-lg border border-accent/40 bg-accent/10 p-6 text-center">
        <CheckCircle2 className="mx-auto size-10 text-accent" />
        <h3 className="mt-3 font-serif text-lg font-bold text-foreground">Manifestação registrada</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Guarde o número de protocolo para acompanhar sua manifestação:
        </p>
        <p className="mt-3 font-mono text-xl font-bold text-accent">{protocolo}</p>
      </div>
    )
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo de manifestação</Label>
        <select
          id="tipo"
          name="tipo"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue="elogio"
        >
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome (opcional)</Label>
          <Input id="nome" name="nome" placeholder="Seu nome" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail (opcional)</Label>
          <Input id="email" name="email" type="email" placeholder="voce@exemplo.com" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mensagem">Mensagem</Label>
        <Textarea id="mensagem" name="mensagem" rows={5} placeholder="Descreva sua manifestação..." />
      </div>

      {erro && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4" /> {erro}
        </div>
      )}

      <Button type="submit" disabled={enviando} className="w-full sm:w-auto">
        {enviando ? <Loader2 className="size-4 animate-spin" /> : null}
        Enviar manifestação
      </Button>

      <p className="text-xs text-muted-foreground">
        A Ouvidoria é um canal para elogios, dúvidas, reclamações, sugestões e denúncias. As
        manifestações anônimas são aceitas; informar e-mail permite receber resposta.
      </p>
    </form>
  )
}
