"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { CheckCircle2, AlertCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cadastrarAssinante } from "@/app/cadastro/actions"

function BotaoEnviar() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      <Mail className="size-4" />
      {pending ? "Enviando..." : "Quero receber as notícias"}
    </Button>
  )
}

export function CadastroCidadaoForm() {
  const [estado, formAction] = useActionState(cadastrarAssinante, null as null | { ok: boolean; message: string })

  if (estado?.ok) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="mt-4 font-serif text-xl font-bold text-primary">Cadastro concluído</h2>
        <p className="mt-2 text-pretty text-muted-foreground">{estado.message}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-border bg-card p-6 md:p-8">
      {estado && !estado.ok && (
        <p className="flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {estado.message}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="nome">Nome completo</Label>
        <Input id="nome" name="nome" required placeholder="Seu nome" autoComplete="name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required placeholder="voce@exemplo.com" autoComplete="email" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cidade">
          Cidade <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Input id="cidade" name="cidade" placeholder="Sua cidade" autoComplete="address-level2" />
      </div>

      <BotaoEnviar />

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Ao se cadastrar, você concorda em receber comunicados sobre editais, provas e resultados dos
        concursos da Marinha do Brasil. Você pode cancelar a qualquer momento.
      </p>
    </form>
  )
}
