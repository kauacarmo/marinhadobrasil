"use client"

import { useActionState } from "react"
import { salvarConfiguracoesSite } from "@/app/admin/configuracoes/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Configuracoes = { orgao: string; email: string; telefone: string; endereco: string; banner_concursos: boolean; notificacoes_email: boolean }

export function SiteSettingsForm({ configuracoes }: { configuracoes: Configuracoes }) {
  const [estado, action, pendente] = useActionState(salvarConfiguracoesSite, null)
  return <form action={action} className="space-y-6">
    <Card><CardHeader><CardTitle className="font-serif">Dados da instituição</CardTitle></CardHeader><CardContent className="space-y-4">
      <div className="space-y-1.5"><label htmlFor="orgao" className="text-sm font-medium">Nome do órgão</label><Input id="orgao" name="orgao" defaultValue={configuracoes.orgao} required /></div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><label htmlFor="email" className="text-sm font-medium">E-mail de contato</label><Input id="email" name="email" type="email" defaultValue={configuracoes.email} required /></div><div className="space-y-1.5"><label htmlFor="telefone" className="text-sm font-medium">Telefone</label><Input id="telefone" name="telefone" defaultValue={configuracoes.telefone} required /></div></div>
      <div className="space-y-1.5"><label htmlFor="endereco" className="text-sm font-medium">Endereço</label><Input id="endereco" name="endereco" defaultValue={configuracoes.endereco} required /></div>
    </CardContent></Card>
    <Card><CardHeader><CardTitle className="font-serif">Preferências do portal</CardTitle></CardHeader><CardContent className="space-y-4">
      <label className="flex items-center justify-between gap-4 text-sm"><span>Exibir banner de concursos abertos</span><input type="checkbox" name="banner_concursos" defaultChecked={configuracoes.banner_concursos} className="size-4 accent-primary" /></label>
      <label className="flex items-center justify-between gap-4 text-sm"><span>Notificações por e-mail</span><input type="checkbox" name="notificacoes_email" defaultChecked={configuracoes.notificacoes_email} className="size-4 accent-primary" /></label>
    </CardContent></Card>
    <div className="flex items-center justify-end gap-3"><span aria-live="polite" className="text-sm text-muted-foreground">{estado?.error ?? (estado?.success ? "Alterações salvas." : "")}</span><Button type="submit" disabled={pendente}>{pendente ? "Salvando..." : "Salvar alterações"}</Button></div>
  </form>
}
