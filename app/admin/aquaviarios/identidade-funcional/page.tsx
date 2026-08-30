import { AdminTopbar } from "@/components/admin/admin-topbar"
import { AquaviariosManager } from "@/components/admin/aquaviarios-manager"
import { contarWebhooksAquaviarios, listarIdentidadesFuncionais } from "../actions"

export const dynamic = "force-dynamic"

export default async function AdminIdentidadeFuncionalPage() {
  const [webhooks, funcionais] = await Promise.all([contarWebhooksAquaviarios(), listarIdentidadesFuncionais()])

  return (
    <>
      <AdminTopbar
        titulo="Identidade Funcional"
        descricao="Emita, consulte e gerencie as identidades funcionais militares."
      />
      <div className="p-6">
        <AquaviariosManager
          webhooks={webhooks}
          funcionaisIniciais={funcionais}
          tipoInicial="funcional_militar"
          modo="identidade"
        />
      </div>
    </>
  )
}
