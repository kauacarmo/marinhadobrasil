"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Webhook,
  Plus,
  Trash2,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react"
import { WEBHOOK_ABAS, type AbaWebhook, type Webhook as WebhookType } from "@/lib/types"
import {
  criarWebhook,
  apagarWebhook,
  alternarWebhook,
  testarWebhook,
} from "@/app/admin/configuracoes/actions"

export function WebhooksManager({ webhooks }: { webhooks: WebhookType[] }) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [novoEm, setNovoEm] = useState<AbaWebhook | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [aberto, setAberto] = useState(false)

  function flashOk(msg: string) {
    setErro(null)
    setOk(msg)
    setTimeout(() => setOk(null), 4000)
  }
  function flashErro(msg: string) {
    setOk(null)
    setErro(msg)
  }

  function submitNovo(aba: AbaWebhook, formData: FormData) {
    formData.set("aba", aba)
    startTransition(async () => {
      const res = await criarWebhook(formData)
      if (res?.error) flashErro(res.error)
      else {
        setNovoEm(null)
        flashOk("Webhook adicionado.")
      }
    })
  }

  function alternar(id: string, ativo: boolean) {
    startTransition(async () => {
      await alternarWebhook(id, ativo)
    })
  }

  function apagar(id: string) {
    startTransition(async () => {
      await apagarWebhook(id)
      flashOk("Webhook removido.")
    })
  }

  function testar(id: string) {
    setOcupado(id)
    startTransition(async () => {
      const res = await testarWebhook(id)
      setOcupado(null)
      if (res?.error) flashErro(res.error)
      else flashOk(res?.message || "Teste enviado.")
    })
  }

  const total = webhooks.length

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50"
        aria-expanded={aberto}
      >
        <span className="flex items-center gap-2">
          <Webhook className="size-5 text-accent" />
          <span className="font-serif text-base font-bold text-foreground">Webhooks</span>
          <Badge variant="secondary">{total}</Badge>
        </span>
        <ChevronDown
          className={`size-5 text-muted-foreground transition-transform ${aberto ? "rotate-180" : ""}`}
        />
      </button>

      {aberto && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure URLs que recebem um POST em JSON quando acontecem eventos em cada aba. Você
            pode adicionar vários endpoints por aba.
          </p>

          {ok && (
            <div className="flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-foreground">
              <CheckCircle2 className="size-4 text-accent" /> {ok}
            </div>
          )}
          {erro && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4" /> {erro}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {WEBHOOK_ABAS.map((aba) => {
        const doAba = webhooks.filter((w) => w.aba === aba.valor)
        return (
          <Card key={aba.valor} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="font-serif text-base">{aba.label}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{aba.descricao}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNovoEm(novoEm === aba.valor ? null : aba.valor)}
              >
                <Plus className="size-4" /> Novo webhook
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {novoEm === aba.valor && (
                <form
                  action={(fd) => submitNovo(aba.valor, fd)}
                  className="space-y-3 rounded-md border border-dashed border-border bg-muted/40 p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
                    <div className="space-y-1.5">
                      <Label htmlFor={`nome-${aba.valor}`}>Nome (opcional)</Label>
                      <Input id={`nome-${aba.valor}`} name="nome" placeholder="Ex.: Zapier" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`url-${aba.valor}`}>URL do webhook</Label>
                      <Input
                        id={`url-${aba.valor}`}
                        name="url"
                        type="url"
                        required
                        placeholder="https://exemplo.com/webhook"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setNovoEm(null)}>
                      Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={isPending}>
                      Adicionar
                    </Button>
                  </div>
                </form>
              )}

              {doAba.length === 0 && novoEm !== aba.valor ? (
                <p className="py-2 text-sm text-muted-foreground">Nenhum webhook configurado.</p>
              ) : (
                doAba.map((w, i) => (
                  <div key={w.id}>
                    {i > 0 && <Separator className="my-1" />}
                    <div className="flex flex-wrap items-center justify-between gap-3 py-1">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-foreground">
                            {w.nome || "Webhook"}
                          </span>
                          <Badge variant={w.ativo ? "default" : "secondary"}>
                            {w.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="truncate text-sm text-muted-foreground">{w.url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testar(w.id)}
                          disabled={isPending && ocupado === w.id}
                        >
                          {ocupado === w.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Send className="size-4" />
                          )}
                          Testar
                        </Button>
                        <Button
                          size="sm"
                          variant={w.ativo ? "secondary" : "default"}
                          onClick={() => alternar(w.id, !w.ativo)}
                          disabled={isPending}
                        >
                          {w.ativo ? "Desativar" : "Ativar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => apagar(w.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
                </CardContent>
              </Card>
            )
          })}
          </div>
        </div>
      )}
    </div>
  )
}
