import { AdminTopbar } from "@/components/admin/admin-topbar"
import { UsuariosManager } from "@/components/admin/usuarios-manager"
import { listUsuarios } from "./actions"

export const dynamic = "force-dynamic"

export default async function UsuariosPage() {
  const usuarios = await listUsuarios()

  return (
    <div>
      <AdminTopbar titulo="Usuários" descricao="Gerencie os usuários administrativos do sistema." />
      <div className="p-6">
        <UsuariosManager usuarios={usuarios} />
      </div>
    </div>
  )
}
