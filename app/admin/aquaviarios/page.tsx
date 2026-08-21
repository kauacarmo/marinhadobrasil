import { AdminTopbar } from "@/components/admin/admin-topbar"
import { AquaviariosManager } from "@/components/admin/aquaviarios-manager"
import { contarWebhooksAquaviarios } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminAquaviariosPage() {
  const webhooks = await contarWebhooksAquaviarios()

  return (
    <>
      <AdminTopbar
        titulo="Aquaviários"
        descricao="Emita a CIR e a Carteira de Identidade Militar e envie ao canal via webhook."
      />
      <div className="p-6">
        <AquaviariosManager webhooks={webhooks} />
      </div>
    </>
  )
}
