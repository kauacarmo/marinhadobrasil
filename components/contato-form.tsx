"use client"

import { useState } from "react"
import { CheckCircle2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ContatoForm() {
  const [enviado, setEnviado] = useState(false)

  if (enviado) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 className="size-7" />
        </span>
        <h3 className="mt-4 font-serif text-xl font-bold text-primary">Mensagem enviada</h3>
        <p className="mt-2 text-pretty text-muted-foreground">
          Recebemos sua mensagem e retornaremos pelo e-mail informado em até 48 horas úteis.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setEnviado(false)}>
          Enviar outra mensagem
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setEnviado(true)
      }}
      className="space-y-5 rounded-lg border border-border bg-card p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="c-nome">Nome</Label>
          <Input id="c-nome" name="nome" required placeholder="Seu nome" autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-email">E-mail</Label>
          <Input id="c-email" name="email" type="email" required placeholder="voce@exemplo.com" autoComplete="email" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="c-assunto">Assunto</Label>
        <Input id="c-assunto" name="assunto" required placeholder="Sobre o que deseja falar" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="c-mensagem">Mensagem</Label>
        <Textarea id="c-mensagem" name="mensagem" required rows={5} placeholder="Escreva sua mensagem" />
      </div>

      <Button type="submit" size="lg" className="w-full">
        <Send className="size-4" />
        Enviar mensagem
      </Button>
    </form>
  )
}
