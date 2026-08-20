import { AdminTopbar } from "@/components/admin/admin-topbar"
import { CandidatosManager } from "@/components/admin/candidatos-manager"
import { listCandidatos } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminCandidatosPage() {
  const candidatos = await listCandidatos()

  return (
    <>
      <AdminTopbar
        titulo="Candidatos"
        descricao="Inscritos nos concursos. Edite, exclua ou limpe todos os registros."
      />
      <div className="p-6">
        <CandidatosManager candidatos={candidatos} />
      </div>
    </>
  )
}
