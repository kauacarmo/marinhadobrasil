import { AdminTopbar } from "@/components/admin/admin-topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { WebhooksManager } from "@/components/admin/webhooks-manager"
import { listWebhooks } from "@/app/admin/configuracoes/actions"

function Campo({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Input defaultValue={defaultValue} />
    </div>
  )
}

export default async function AdminConfiguracoesPage() {
  const webhooks = await listWebhooks()

  return (
    <>
      <AdminTopbar
        titulo="Configurações"
        descricao="Ajuste os dados institucionais e as preferências do portal."
      />

      <div className="max-w-3xl space-y-6 p-6">
        <WebhooksManager webhooks={webhooks} />

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
