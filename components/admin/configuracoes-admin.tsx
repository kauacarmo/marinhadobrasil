"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Webhook } from "@/lib/types"

export function ConfiguracoesAdmin({ webhooks }: { webhooks: Webhook[] }) {
  const [aba, setAba] = useState<"logs" | "banco">("logs")
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Administração do sistema</CardTitle>
        <CardDescription>Informações técnicas disponíveis somente para administradores.</CardDescription>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => setAba("logs")} className={`rounded-md px-3 py-2 text-sm font-medium ${aba === "logs" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Logs do sistema</button>
          <button type="button" onClick={() => setAba("banco")} className={`rounded-md px-3 py-2 text-sm font-medium ${aba === "banco" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Banco de dados</button>
        </div>
      </CardHeader>
      <CardContent>
        {aba === "logs" ? (
          <div className="space-y-2">
            {webhooks.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p> : webhooks.slice(0, 8).map((webhook) => (
              <div key={webhook.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
                <div><p className="font-medium">Webhook configurado</p><p className="text-xs text-muted-foreground">{webhook.nome || webhook.aba} · {webhook.url}</p></div>
                <span className="text-xs text-muted-foreground">{webhook.ativo ? "Ativo" : "Inativo"}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Serviço</p><p className="font-medium">Supabase</p></div>
            <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Conexão</p><p className="font-medium text-emerald-600">Configurada</p></div>
            <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Tabelas usadas</p><p className="font-medium">Documentos, usuários e webhooks</p></div>
            <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Credenciais</p><p className="font-medium">Protegidas</p></div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
