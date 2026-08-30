import { AdminTopbar } from "@/components/admin/admin-topbar"
import { AquaviariosManager } from "@/components/admin/aquaviarios-manager"
import { contarWebhooksAquaviarios, listarIdentidadesFuncionais } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminAquaviariosPage() {
  const [webhooks, funcionais] = await Promise.all([contarWebhooksAquaviarios(), listarIdentidadesFuncionais()])

  return (
    <>
      <AdminTopbar
        titulo="Documentos"
        descricao="Emita a CIR, a Carteira Náutica, a Carteira Aérea e acompanhe suas identidades funcionais."
      />
      <div className="p-6">
        <AquaviariosManager webhooks={webhooks} funcionaisIniciais={funcionais} />
      </div>
    </>
  )
}
