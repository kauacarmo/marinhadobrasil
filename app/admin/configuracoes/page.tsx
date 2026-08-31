import { AdminTopbar } from "@/components/admin/admin-topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { WebhooksManager } from "@/components/admin/webhooks-manager"
import { listWebhooks } from "@/app/admin/configuracoes/actions"
import { ConfiguracoesAdmin } from "@/components/admin/configuracoes-admin"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import Link from "next/link"
import { UserCog } from "lucide-react"

function Campo({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Input defaultValue={defaultValue} />
    </div>
  )
}

export default async function AdminConfiguracoesPage() {
  const sessao = (await cookies()).get("cpsp_sessao")?.value
  let papel = ""
  try { papel = sessao ? JSON.parse(sessao).papel ?? "" : "" } catch { papel = "" }
  if (papel !== "admin") redirect("/admin")

  const webhooks = await listWebhooks()

  return (
    <>
      <AdminTopbar
        titulo="Configurações"
        descricao="Ajuste os dados institucionais e as preferências do portal."
      />

      <div className="max-w-3xl space-y-6 p-6">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Link href="/admin/configuracoes" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">Geral</Link>
          <Link href="/admin/usuarios" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><UserCog className="size-4" /> Usuários</Link>
        </div>
        <WebhooksManager webhooks={webhooks} />

        <ConfiguracoesAdmin webhooks={webhooks} />

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Dados da instituição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Campo label="Nome do órgão" defaultValue="Diretoria de Ensino da Marinha" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="E-mail de contato" defaultValue="concursos@marinha.mil.br" />
              <Campo label="Telefone" defaultValue="(21) 2104-5000" />
            </div>
            <Campo label="Endereço" defaultValue="Rua da Ponte, s/nº - Ilha das Cobras - Rio de Janeiro/RJ" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Preferências do portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Exibir banner de concursos abertos</p>
                <p className="text-sm text-muted-foreground">Destaca editais com inscrições em aberto na home.</p>
              </div>
              <Button variant="secondary" size="sm">Ativado</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Notificações por e-mail</p>
                <p className="text-sm text-muted-foreground">Envia avisos automáticos aos candidatos inscritos.</p>
              </div>
              <Button variant="secondary" size="sm">Ativado</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar alterações</Button>
        </div>
      </div>
    </>
  )
}
