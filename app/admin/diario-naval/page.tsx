import { AdminTopbar } from "@/components/admin/admin-topbar"
import { DiarioNavalManager } from "@/components/admin/diario-naval-manager"
import { contarWebhooksDiarioNaval } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminDiarioNavalPage() {
  const ativos = await contarWebhooksDiarioNaval()

  return (
    <>
      <AdminTopbar
        titulo="Diário Naval"
        descricao="Publique comunicados exclusivamente no canal Diário Naval via webhook."
      />
      <div className="p-6">
        <DiarioNavalManager temWebhook={ativos > 0} />
      </div>
    </>
  )
}
