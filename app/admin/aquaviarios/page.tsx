import { AdminTopbar } from "@/components/admin/admin-topbar"
import { AquaviariosManager } from "@/components/admin/aquaviarios-manager"
import { contarWebhooksAquaviarios, listarIdentidadesFuncionais } from "./actions"
import { listUsuarios } from "@/app/admin/usuarios/actions"

export const dynamic = "force-dynamic"

export default async function AdminAquaviariosPage() {
  const [webhooksResult, funcionaisResult, usuariosResult] = await Promise.allSettled([
    contarWebhooksAquaviarios(),
    listarIdentidadesFuncionais(),
    listUsuarios(),
  ])
  const webhooks = webhooksResult.status === "fulfilled" ? webhooksResult.value : { cir: 0, carteira_nautica: 0, funcional_militar: 0 }
  const funcionais = funcionaisResult.status === "fulfilled" ? funcionaisResult.value : []
  const usuarios = usuariosResult.status === "fulfilled" ? usuariosResult.value : []

  return (
    <>
      <AdminTopbar
        titulo="Documentos"
        descricao="Emita a CIR, a Carteira Náutica, a Carteira Aérea e acompanhe suas identidades funcionais."
      />
      <div className="p-6">
        <AquaviariosManager webhooks={webhooks} funcionaisIniciais={funcionais} membros={usuarios.filter((usuario) => usuario.ativo)} />
      </div>
    </>
  )
}
