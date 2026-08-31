import { AdminTopbar } from "@/components/admin/admin-topbar"
import { Separator } from "@/components/ui/separator"
import { WebhooksManager } from "@/components/admin/webhooks-manager"
import { listWebhooks, obterConfiguracoesSite } from "@/app/admin/configuracoes/actions"
import { ConfiguracoesAdmin } from "@/components/admin/configuracoes-admin"
import { SiteSettingsForm } from "@/components/admin/site-settings-form"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function AdminConfiguracoesPage() {
  const sessao = (await cookies()).get("cpsp_sessao")?.value
  let papel = ""
  try { papel = sessao ? JSON.parse(sessao).papel ?? "" : "" } catch { papel = "" }
  if (papel !== "admin") redirect("/admin")

  const [webhooks, configuracoes] = await Promise.all([listWebhooks(), obterConfiguracoesSite()])

  return (
    <>
      <AdminTopbar
        titulo="Configurações"
        descricao="Ajuste os dados institucionais e as preferências do portal."
      />

      <div className="max-w-3xl space-y-6 p-6">
        <WebhooksManager webhooks={webhooks} />

        <ConfiguracoesAdmin webhooks={webhooks} />

        <Separator />
        <SiteSettingsForm configuracoes={configuracoes} />
      </div>
    </>
  )
}
