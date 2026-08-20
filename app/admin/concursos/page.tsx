import { AdminTopbar } from "@/components/admin/admin-topbar"
import { ConcursosManager } from "@/components/admin/concursos-manager"
import { listContests } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminConcursosPage() {
  const contests = await listContests()

  return (
    <>
      <AdminTopbar
        titulo="Gestão de Concursos"
        descricao="Controle a situação de cada concurso e gere as provas por inteligência artificial."
      />
      <div className="p-6">
        <ConcursosManager contests={contests} />
      </div>
    </>
  )
}
