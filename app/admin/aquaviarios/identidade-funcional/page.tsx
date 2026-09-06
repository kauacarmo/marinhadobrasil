import { AdminTopbar } from "@/components/admin/admin-topbar"
import { AquaviariosManager } from "@/components/admin/aquaviarios-manager"
import { contarWebhooksAquaviarios, listarIdentidadesFuncionais } from "../actions"

export const dynamic = "force-dynamic"

export default async function AdminIdentidadeFuncionalPage() {
  const [webhooksResult, funcionaisResult] = await Promise.allSettled([
    contarWebhooksAquaviarios(),
    listarIdentidadesFuncionais(),
  ])
  const webhooks = webhooksResult.status === "fulfilled" ? webhooksResult.value : { cir: 0, carteira_nautica: 0, funcional_militar: 0 }
  const funcionais = funcionaisResult.status === "fulfilled" ? funcionaisResult.value : []

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
